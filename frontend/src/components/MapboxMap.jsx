import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";

import { Box } from "@chakra-ui/react";
import { Global, css } from "@emotion/react";
import ListingPopup from "./ListingPopup.jsx";

// Lấy token từ biến môi trường
const token = import.meta.env.VITE_MAPBOX_TOKEN;

if (!token) {
  console.error("❌ Missing Mapbox token");
  return;
}

mapboxgl.accessToken = token;

const MapboxMap = ({
  mode = "view", // "view" | "picker" | "explorer"
  data = [],
  initialCoords = [105.854444, 21.028511], // Hà Nội mặc định
  onLocationSelect,
  height = "400px",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const markersArrayRef = useRef([]);
  const directionsRef = useRef(null);
  const geolocateRef = useRef(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const navigate = useNavigate();

  // --- GLOBAL STYLES (Ghi đè CSS Mapbox) ---
  const GlobalStyles = css`
    /* 1. Reset style Popup mặc định để dùng React Component */
    .mapboxgl-popup-content {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    .mapboxgl-popup-close-button {
      display: none !important; /* Ẩn nút X mặc định của Mapbox */
    }
    .mapboxgl-popup-tip {
      border-top-color: white !important; /* Màu mũi tên trỏ xuống */
      margin-top: -1px;
    }

    /* 2. Hiệu ứng Hover cho Marker (Target vào SVG bên trong) */
    .mapboxgl-marker {
      cursor: pointer;
    }
    .mapboxgl-marker:hover svg {
      transform: scale(1.3); /* Phóng to 30% */
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
    }
    .mapboxgl-marker:hover {
      z-index: 99 !important; /* Đè lên các marker khác */
    }

    .mapboxgl-ctrl-directions {
      min-width: 250px !important;
      max-width: 300px !important;
    }

    .mapbox-directions-instructions {
      max-height: 250px !important;
      overflow-y: auto !important;
    }

    .mapbox-directions-destination {
      display: none !important;
    }

    /* 1. Tăng kích thước và làm nổi bật nút */
    .mapboxgl-ctrl-geolocate {
      width: 40px !important;
      height: 40px !important;
      border-radius: 8px !important; /* Bo góc mềm mại hơn */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15) !important; /* Đổ bóng rõ hơn */
      // border: 2px solid #3182ce !important; /* Viền màu xanh nổi bật */
      transition: all 0.2s ease-in-out;
    }

    /* 2. Icon bên trong to hơn và đổi màu xanh */
    .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
      background-size: 24px 24px !important; /* Icon to hơn (mặc định là 20px) */
      filter: invert(38%) sepia(68%) saturate(3365%) hue-rotate(190deg)
        brightness(98%) contrast(94%); /* Đổi màu icon sang xanh dương */
    }

    /* 3. Hiệu ứng khi rê chuột vào (Hover) */
    .mapboxgl-ctrl-geolocate:hover {
      background-color: #ebf8ff !important; /* Nền xanh nhạt khi hover */
      transform: scale(1.05); /* Phóng to nhẹ */
    }

    /* 4. Khi đang định vị (Active) */
    .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active {
      background-color: #3182ce !important; /* Nền xanh đậm khi đang active */
    }
    .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active
      .mapboxgl-ctrl-icon {
      filter: invert(100%) !important; /* Icon chuyển sang màu trắng */
      animation: pulse 2s infinite; /* Hiệu ứng "thở" nhẹ */
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(49, 130, 206, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0);
      }
    }

    /* 5. Thêm Tooltip "Vị trí của bạn" (Tùy chọn) */
    /* Tạo một pseudo-element để làm tooltip */
    .mapboxgl-ctrl-geolocate::after {
      content: "Vị trí của bạn";
      position: absolute;
      left: 110%; /* Hiện bên phải nút */
      top: 50%;
      transform: translateY(-50%);
      background: #333;
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    /* Hiện tooltip khi hover */
    .mapboxgl-ctrl-group:hover .mapboxgl-ctrl-geolocate::after {
      opacity: 1;
    }
  `;

  // --- INIT MAP ---
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoords,
      zoom: mode === "explorer" ? 10 : 13,
      projection: "globe", // Hiệu ứng quả địa cầu 3D khi zoom xa
    });

    // Resize observer để map không bị méo khi container thay đổi kích thước
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainerRef.current)
      resizeObserver.observe(mapContainerRef.current);

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );

      // Hiệu ứng khí quyển cho đẹp
      mapRef.current.setFog({
        range: [0.5, 10],
        color: "white",
        "horizon-blend": 0.3,
      });
    });

    // --- LOGIC ẨN MARKER KHI ZOOM QUÁ XA ---
    mapRef.current.on("zoom", () => {
      if (mode !== "explorer") return;

      const currentZoom = mapRef.current.getZoom();
      // Ngưỡng zoom: < 6 thì ẩn (mức quốc gia/châu lục)
      const shouldShow = currentZoom >= 6;

      markersArrayRef.current.forEach((marker) => {
        const el = marker.getElement();
        if (el) {
          el.style.display = shouldShow ? "block" : "none";
        }
      });
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

  const cleanUp = () => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (geocoderRef.current && mapRef.current.hasControl(geocoderRef.current)) {
      mapRef.current.removeControl(geocoderRef.current);
      geocoderRef.current = null;
    }
    // Xóa tất cả marker explorer cũ
    if (markersArrayRef.current.length > 0) {
      markersArrayRef.current.forEach((marker) => marker.remove());
      markersArrayRef.current = [];
    }
    if (
      directionsRef.current &&
      mapRef.current.hasControl(directionsRef.current)
    ) {
      mapRef.current.removeControl(directionsRef.current);
      directionsRef.current = null;
    }

    if (
      geolocateRef.current &&
      mapRef.current.hasControl(geolocateRef.current)
    ) {
      mapRef.current.removeControl(geolocateRef.current);
      geolocateRef.current = null;
    }
  };

  // --- HANDLE MODES CHANGE ---
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    cleanUp();

    if (mode === "picker") setupPickerMode();
    else if (mode === "view") setupViewMode();
    else if (mode === "explorer") setupExplorerMode();
    else if (mode === "directions") setupDirectionsMode();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, mode, JSON.stringify(initialCoords), JSON.stringify(data)]);

  // --- 1. PICKER MODE (Chọn vị trí) ---
  const setupPickerMode = () => {
    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Nhập địa chỉ...",
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
      if (e.originalEvent.target.closest(".mapboxgl-ctrl")) return; // Tránh click nhầm vào control
      const { lng, lat } = e.lngLat;
      updateMarkerAndCallback(lng, lat);
    });
    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  const updateMarkerAndCallback = (lng, lat, address = "") => {
    if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    if (onLocationSelect) onLocationSelect(lng, lat, address);
  };

  // --- 2. VIEW MODE (Xem 1 vị trí cố định) ---
  const setupViewMode = () => {
    markerRef.current = new mapboxgl.Marker({ color: "#E53935" })
      .setLngLat(initialCoords)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML("<h6>Vị trí BĐS</h6>")
      )
      .addTo(mapRef.current);
    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  // --- 3. EXPLORER MODE (Xem nhiều vị trí) ---
  const setupExplorerMode = () => {
    if (!data || data.length === 0) return;

    const validListings = data.filter(
      (item) => item.location?.coords?.coordinates?.length === 2
    );

    // Kiểm tra zoom ban đầu để quyết định hiển thị
    const initialZoom = mapRef.current.getZoom();
    const shouldShowInitially = initialZoom >= 6;

    validListings.forEach((item) => {
      // Tạo marker đỏ mặc định
      const marker = new mapboxgl.Marker({
        color: "#E53935",
        draggable: false,
      })
        .setLngLat(item.location.coords.coordinates)
        .addTo(mapRef.current);

      // Ẩn nếu zoom quá xa ban đầu
      if (!shouldShowInitially) {
        marker.getElement().style.display = "none";
      }

      // --- SỰ KIỆN CLICK MARKER ---
      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();

        // A. Bay đến vị trí (Zoom mức 14 - vừa phải)
        mapRef.current.flyTo({
          center: item.location.coords.coordinates,
          zoom: 14,
          speed: 1.2,
          curve: 1.42,
          essential: true,
        });

        // B. Xóa popup cũ (nếu có)
        const popups = document.getElementsByClassName("mapboxgl-popup");
        if (popups.length) popups[0].remove();

        // C. Render Popup mới bằng React Portal
        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        root.render(
          <ListingPopup
            item={item}
            onClose={() => {
              marker.getPopup()?.remove();
            }}
            onNavigate={(id) => navigate(`/listings/${id}`)}
          />
        );

        // D. Gắn vào Mapbox Popup
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: "360px",
          offset: 25, // Cách đỉnh marker một đoạn
          anchor: "bottom",
        }).setDOMContent(popupNode);

        marker.setPopup(popup);
        marker.togglePopup();

        // E. Cleanup React root khi popup đóng
        popup.on("close", () => {
          setTimeout(() => root.unmount(), 0);
        });
      });

      markersArrayRef.current.push(marker);
    });
  };

  const setupDirectionsMode = () => {
    directionsRef.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric", // Hiển thị km/m thay vì dặm
      profile: "mapbox/driving", // Mặc định là lái xe (có thể là walking, cycling)
      controls: {
        inputs: true,
        instructions: true,
        profileSwitcher: true,
      },
      language: "vi",
      placeholderOrigin: "Vị trí của bạn",
      placeholderDestination: "Điểm đến",
    });

    mapRef.current.addControl(directionsRef.current, "top-left");

    // Tự động set điểm ĐẾN (Destination) là initialCoords
    if (initialCoords && initialCoords.length === 2) {
      directionsRef.current.setDestination(initialCoords);
    }

    markerRef.current = new mapboxgl.Marker({
      color: "#E53935",
      draggable: false,
    })
      .setLngLat(initialCoords)
      .addTo(mapRef.current);

    geolocateRef.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true, // Theo dõi nếu người dùng di chuyển
      showUserHeading: true, // Hiển thị hướng nhìn
    });

    mapRef.current.addControl(geolocateRef.current, "top-left");

    geolocateRef.current.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;

      // Tự động điền vào ô A của Directions
      directionsRef.current.setOrigin([lng, lat]);
    });
  };

  return (
    <>
      <Global styles={GlobalStyles} />
      <Box
        ref={mapContainerRef}
        w="100%"
        h={height}
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
        position="relative"
        shadow="sm"
      />
    </>
  );
};

export default MapboxMap;
