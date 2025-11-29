import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../components/mb.css";

// Lấy token từ biến môi trường
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({
  mode = "view",
  data = [],
  initialCoords = [105.854444, 21.028511], // Mặc định Hà Nội
  onLocationSelect,
  height = "400px",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); // Cho mode picker/view
  const geocoderRef = useRef(null);
  // --- MỚI: Ref để lưu trữ mảng các HTML markers trong chế độ explorer ---
  const markersArrayRef = useRef([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const navigate = useNavigate(); // Hook để chuyển trang

  // 1. KHỞI TẠO MAP
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoords,
      zoom: mode === "explorer" ? 10 : 13,
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainerRef.current) resizeObserver.observe(mapContainerRef.current);

    setTimeout(() => {
        if (mapRef.current) mapRef.current.resize();
    }, 200);

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
    });

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. XỬ LÝ LOGIC CHÍNH
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // Dọn dẹp
    cleanUp();

    // Setup theo mode
    if (mode === "picker") {
      setupPickerMode();
    } else if (mode === "view") {
      setupViewMode();
    } else if (mode === "explorer") {
      setupExplorerMode();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, mode, JSON.stringify(initialCoords), JSON.stringify(data)]);

  // --- HELPER: Dọn dẹp (Đã cập nhật) ---
  const cleanUp = () => {
    if (!mapRef.current) return;

    // Xóa marker đơn (picker/view)
    if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
    }
    // Xóa geocoder
    if (geocoderRef.current && mapRef.current.hasControl(geocoderRef.current)) {
        mapRef.current.removeControl(geocoderRef.current);
        geocoderRef.current = null;
    }

    // --- MỚI: Xóa tất cả HTML markers của explorer mode ---
    if (markersArrayRef.current.length > 0) {
        markersArrayRef.current.forEach(marker => marker.remove());
        markersArrayRef.current = [];
    }
  };

  // --- MODE 1: PICKER (Giữ nguyên) ---
  const setupPickerMode = () => {
    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Tìm địa chỉ...",
      countries: "vn",
    });
    mapRef.current.addControl(geocoderRef.current, "top-left");

    geocoderRef.current.on("result", (e) => {
      const [lng, lat] = e.result.center;
      updateMarkerAndCallback(lng, lat, e.result.place_name);
    });

    markerRef.current = new mapboxgl.Marker({
      draggable: true,
      color: "#E53935",
    })
      .setLngLat(initialCoords)
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const { lng, lat } = markerRef.current.getLngLat();
      updateMarkerAndCallback(lng, lat);
    });

    mapRef.current.on("click", (e) => {
      if (e.originalEvent.target.closest(".mapboxgl-ctrl")) return;
      const { lng, lat } = e.lngLat;
      updateMarkerAndCallback(lng, lat);
    });

    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  const updateMarkerAndCallback = (lng, lat, address = "") => {
    if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    if (onLocationSelect) {
      onLocationSelect(lng, lat, address);
    }
  };

  // --- MODE 2: VIEW (Giữ nguyên) ---
  const setupViewMode = () => {
    markerRef.current = new mapboxgl.Marker({ color: "#E53935" })
      .setLngLat(initialCoords)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h6>Vị trí bất động sản</h6>"))
      .addTo(mapRef.current);

    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  // --- MODE 3: EXPLORER (Logic: Marker Giá nhỏ -> Click ra Card to) ---
  const setupExplorerMode = () => {
    if (!data || data.length === 0) return;

    // Lọc dữ liệu sạch
    const validListings = data.filter(
      (item) =>
        item.location &&
        item.location.coords &&
        Array.isArray(item.location.coords.coordinates) &&
        item.location.coords.coordinates.length === 2
    );

    // Duyệt qua từng bài đăng
    validListings.forEach((item) => {
      // --- BƯỚC 1: TẠO MARKER GIÁ TIỀN (Hiển thị mặc định) ---
      const el = document.createElement("div");
      el.className = "price-marker"; 
      // Style inline cho Marker giá tiền (nhỏ gọn, màu đen)
      el.innerText = item.price || "LH";
      Object.assign(el.style, {
        backgroundColor: "#222",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "13px",
        padding: "6px 10px",
        borderRadius: "6px",
        boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        border: "1px solid #444",
        whiteSpace: "nowrap",
      });

      // Tạo Marker Mapbox
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "bottom", // Neo ở đáy
        offset: [0, -5],  // Dịch lên một chút
      })
        .setLngLat(item.location.coords.coordinates)
        .addTo(mapRef.current);

      // --- BƯỚC 2: XỬ LÝ SỰ KIỆN CLICK VÀO MARKER ---
      el.addEventListener("click", (e) => {
        e.stopPropagation(); // Ngăn click xuyên qua bản đồ

        // Đóng các popup khác đang mở (nếu muốn chỉ hiện 1 cái)
        const popups = document.getElementsByClassName("mapboxgl-popup");
        if (popups.length) popups[0].remove();

        // --- BƯỚC 3: TẠO NỘI DUNG CARD (POPUP) ---
        // Chuẩn bị dữ liệu
        const imageUrl = item.images?.[0]?.url || "https://via.placeholder.com/150";
        const title = item.title;
        const price = item.price || "Liên hệ";
        const areaDisplay = item.area ? `(${item.area} m²)` : "";
        const isVip = false; 

        // Tạo thẻ DIV chứa nội dung Card
        const popupNode = document.createElement("div");
        popupNode.className = "property-marker-card"; // Dùng lại class CSS Card của bạn
        // Reset style để nó hiển thị đúng trong popup (tránh bị transform của marker cũ ảnh hưởng)
        popupNode.style.transform = "none"; 
        popupNode.style.marginTop = "0";
        popupNode.style.position = "relative"; // Để căn chỉnh nút X

        // HTML nội dung (Giữ nguyên cấu trúc bạn đã làm)
        popupNode.innerHTML = `
            <div class="close-btn" style="
                position: absolute; top: 8px; right: 8px; z-index: 20; 
                background: rgba(0,0,0,0.6); color: white; width: 24px; height: 24px; 
                border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                cursor: pointer; font-size: 14px; font-weight: bold;">
                ✕
            </div>

            <div class="pm-image-container">
                <img src="${imageUrl}" alt="${title}" class="pm-image" />
                ${isVip ? '<span class="pm-tag-vip">VIP</span>' : ''}
            </div>
            <div class="pm-info-container">
                <div class="pm-title" title="${title}">${title}</div>
                <div class="pm-details">
                    <span class="pm-price">${price}</span>
                    <span class="pm-area">${areaDisplay}</span>
                </div>
            </div>
        `;

        // Xử lý sự kiện trong Popup
        // 1. Click nút X -> Đóng popup
        popupNode.querySelector(".close-btn").addEventListener("click", (ev) => {
            ev.stopPropagation(); // Không kích hoạt chuyển trang
            marker.getPopup().remove(); // Lệnh đóng popup của Mapbox
        });

        // 2. Click vào phần còn lại -> Chuyển trang
        popupNode.addEventListener("click", () => {
            navigate(`/listings/${item._id}`);
        });

        // --- BƯỚC 4: GẮN POPUP VÀO MARKER ---
        const popup = new mapboxgl.Popup({
            closeButton: false, // Tắt nút X mặc định xấu xí của Mapbox
            closeOnClick: true, // Click ra ngoài bản đồ cũng đóng
            maxWidth: "300px",
            offset: 15 // Cách marker giá tiền 1 đoạn
        })
        .setDOMContent(popupNode); // Dùng setDOMContent thay vì setHTML để giữ sự kiện navigate

        marker.setPopup(popup); // Gắn popup vào marker
        marker.togglePopup();   // Mở ngay lập tức
      });

      // 5. Lưu marker vào mảng để quản lý
      markersArrayRef.current.push(marker);
    });
  };

  return (
    <Box
      ref={mapContainerRef}
      w="100%"
      h={height}
      borderRadius="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
      position="relative"
    />
  );
};

export default MapboxMap;