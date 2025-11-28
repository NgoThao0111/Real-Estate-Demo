import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Box, Button, Image, Text, VStack } from "@chakra-ui/react"; // Ví dụ dùng Chakra UI để style popup sau này

// Lấy token từ biến môi trường
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * @param {string} mode - 'picker' | 'view' | 'explorer'
 * @param {Array} data - Dùng cho mode 'explorer': Danh sách các BĐS
 * @param {Array} initialCoords - [lng, lat] Dùng cho mode 'picker' hoặc 'view'
 * @param {Function} onLocationSelect - Callback trả về {lng, lat, address} khi pick
 */
const MapboxMap = ({
  mode = "view",
  data = [],
  initialCoords = [105.854444, 21.028511], // Mặc định Hà Nội
  onLocationSelect,
  height = "400px",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // State để quản lý việc map đã load xong chưa
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. KHỞI TẠO MAP (Chạy 1 lần)
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoords,
      zoom: mode === "explorer" ? 10 : 13, // Explorer thì nhìn xa hơn
    });

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
      // Thêm Navigation Control (Zoom +/-)
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. XỬ LÝ LOGIC THEO TỪNG MODE (Chạy khi map load xong hoặc props đổi)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // Reset những thứ cũ nếu cần (ví dụ xóa marker cũ)
    if (markerRef.current) markerRef.current.remove();

    /* --- CASE 1: PICKER (Chọn vị trí) --- */
    if (mode === "picker") {
      setupPickerMode();
    } else if (mode === "view") {

    /* --- CASE 2: VIEW (Xem 1 vị trí) --- */
      setupViewMode();
    } else if (mode === "explorer") {

    /* --- CASE 3: EXPLORER (Xem nhiều vị trí) --- */
      setupExplorerMode();
    }
  }, [isMapLoaded, mode, initialCoords, data]);

  // --- HÀM XỬ LÝ: PICKER ---
  const setupPickerMode = () => {
    // 1. Thêm thanh tìm kiếm (chỉ add 1 lần)
    if (!document.querySelector(".mapboxgl-ctrl-geocoder")) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: "Tìm địa chỉ...",
        countries: "vn",
      });
      mapRef.current.addControl(geocoder, "top-left");

      geocoder.on("result", (e) => {
        const [lng, lat] = e.result.center;
        updateMarkerAndCallback(lng, lat, e.result.place_name);
      });
    }

    // 2. Tạo Marker kéo thả được
    markerRef.current = new mapboxgl.Marker({
      draggable: true,
      color: "#E53935", // Màu đỏ
    })
      .setLngLat(initialCoords)
      .addTo(mapRef.current);

    // 3. Sự kiện kéo marker
    markerRef.current.on("dragend", () => {
      const { lng, lat } = markerRef.current.getLngLat();
      updateMarkerAndCallback(lng, lat);
    });

    // 4. Click vào bản đồ để đặt marker
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      updateMarkerAndCallback(lng, lat);
    });

    // Fly tới vị trí ban đầu
    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  const updateMarkerAndCallback = (lng, lat, address = "") => {
    markerRef.current.setLngLat([lng, lat]);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    if (onLocationSelect) {
      onLocationSelect(lng, lat, address);
    }
  };

  // --- HÀM XỬ LÝ: VIEW (Đơn giản nhất) ---
  const setupViewMode = () => {
    markerRef.current = new mapboxgl.Marker({ color: "#E53935" })
      .setLngLat(initialCoords)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          "<h6>Vị trí bất động sản</h6>"
        )
      ) // Có thể thêm popup
      .addTo(mapRef.current);

    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  // --- HÀM XỬ LÝ: EXPLORER (Nâng cao cho tương lai) ---
  const setupExplorerMode = () => {
    // Nếu chưa có data thì thôi
    if (!data || data.length === 0) return;

    // Chuẩn bị dữ liệu GeoJSON
    const geoJsonData = {
      type: "FeatureCollection",
      features: data.map((item) => ({
        type: "Feature",
        geometry: item.location.coords, // Lấy từ DB {type: Point, coordinates: [lng, lat]}
        properties: {
          id: item._id,
          title: item.title,
          price: item.price,
          image: item.images[0]?.url,
        },
      })),
    };

    // Kiểm tra source đã có chưa để update hoặc add mới
    const sourceId = "listings-source";
    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.getSource(sourceId).setData(geoJsonData);
    } else {
      mapRef.current.addSource(sourceId, {
        type: "geojson",
        data: geoJsonData,
        cluster: true, // BẬT CHẾ ĐỘ GOM NHÓM
        clusterMaxZoom: 14,
        clusterRadius: 50, // Bán kính gom nhóm (px)
      });

      // 1. Layer vòng tròn Cluster (Khi zoom out)
      mapRef.current.addLayer({
        id: "clusters",
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      // 2. Layer số đếm trong Cluster
      mapRef.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      // 3. Layer điểm đơn lẻ (Khi zoom in hoặc không bị gom) -> Dùng ảnh hoặc chấm tròn
      mapRef.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#E53935",
          "circle-radius": 8,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      // Sự kiện click vào điểm đơn lẻ -> Hiện Popup
      mapRef.current.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, price, image } = e.features[0].properties;

        // HTML string cho popup (Sau này có thể làm phức tạp hơn)
        const popupContent = `
                <div style="font-family: sans-serif; width: 200px;">
                    <img src="${image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;"/>
                    <h4 style="font-size: 14px; margin: 5px 0;">${title}</h4>
                    <p style="color: red; font-weight: bold;">${price}</p>
                </div>
            `;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(mapRef.current);
      });

      // Sự kiện click vào Cluster -> Zoom vào
      mapRef.current.on("click", "clusters", (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        mapRef.current
          .getSource(sourceId)
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            mapRef.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      // Đổi con chuột thành bàn tay khi hover
      mapRef.current.on(
        "mouseenter",
        "clusters",
        () => (mapRef.current.getCanvas().style.cursor = "pointer")
      );
      mapRef.current.on(
        "mouseleave",
        "clusters",
        () => (mapRef.current.getCanvas().style.cursor = "")
      );
      mapRef.current.on(
        "mouseenter",
        "unclustered-point",
        () => (mapRef.current.getCanvas().style.cursor = "pointer")
      );
      mapRef.current.on(
        "mouseleave",
        "unclustered-point",
        () => (mapRef.current.getCanvas().style.cursor = "")
      );
    }
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
