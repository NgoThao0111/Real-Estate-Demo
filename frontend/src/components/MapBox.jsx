import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const geoJsonData = {
  type: "FeatureCollection",
  features: REAL_ESTATE_DATA.map((item) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: item.coords },
    properties: { ...item },
  })),
};

const MapboxExample = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderContainerRef = useRef(null);

  const tempMarkerRef = useRef(null);

  const [isRouting, setIsRouting] = useState(false);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useState(() => {
    if (mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/street-v12",
      center: [105.854444, 21.028511],
      zoom: 12,
    });

    const mainGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Tìm kiếm bất động sản...",
      language: "vi",
      countries: "vn",
    });

    mapRef.current.addControl(mainGeocoder, "top-left");
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    mapRef.current.on("load", () => {
      //Layer đường đi
      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#007bff",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });

      //Layer nhà đất
      mapRef.current.addSource("real-estate-points", {
        type: "geojson",
        data: geoJsonData,
      });

      mapRef.current.addLayer({
        id: "price-bg",
        type: "circle",
        source: "real-estate-points",
        paint: {
          "circle-radius": 18,
          "circle-color": "#ffffff",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ccc",
        },
      });

      mapRef.current.addLayer({
        id: "price-text",
        type: "symbol",
        source: "real-estate-points",
        layout: {
          "text-field": ["get", "price"],
          "text-font": ["Open Sans Bold"],
          "text-size": 11,
        },
        paint: { "text-color": "#B71C1C" },
      });

      //Sự kiện Click vào nhà
      mapRef.current.on(
        "mouseenter",
        "price-bg",
        () => (mapRef.current.getCanvas().style.cursor = "pointer")
      );
      mapRef.current.on(
        "mouseleave",
        "price-bg",
        () => (useColorModePreference.current.getCanvas().style.cursor = "")
      );
      mapRef.current.on("click", "price-bg", (e) => {
        const coordinates = e.feature[0].geometry.coordinates.slice();
        const props = e.features[0].properties;
        openPopup(coordinates, props);
      });

      mapRef.current.on("click", "price-bg", (e) => {
        //Nếu click vào lớp nhà (price-bg) thì thôi, để popup nhà hiện lên
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ["price-bg"],
        });
        if (features.length > 0) return;

        const { lng, lat } = e.lngLat;

        //Bước quan trọng: Kiểm tra và xóa marker cũ nếu có
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
        }

        //Tạo marker mới màu đen (để khác màu với marker nhà)
        const newMarker = new mapboxgl.Marker({ color: "black" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        console.log("Tọa độ bạn vừa click:", lng, lat);
        alert(`Bạn đã click vào tọa độ: \nKinh độ: ${lng} \nVĩ độ: ${lat}`);

        //Lưu marker mới vào biến ref để lần sau còn xóa
        tempMarkerRef.current = newMarker;

        // Nếu đang ở chế độ dẫn đường -> Tự động điền vào ô "Điểm xuất phát" và vẽ đường
        if (document.querySelector(".custom-geocoder")) {
          // Cập nhật đường đi ngay lập tức
          // Lưu ý: destination là biến state, cần truy cập cẩn thận.
          // (Trong useEffect đóng kín này, destination có thể bị cũ.
          // Tốt nhất là logic vẽ đường nên để effect khác xử lý hoặc dùng Ref cho destination)
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  //Effect xử lý vẽ đường khi người dùng click trên bản đồ (lúc đang routing)
  useEffect(() => {
    if (!isRouting || !mapRef.current) return;

    const handleClickMap = (e) => {
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: ["price-bg"],
      });
      if (features.length > 0) return; //Click trúng nhà thì thôi

      const coords = [e.lngLat.lng, e.lngLat.lat];

      //gọi hàm vẽ đường từ điểm vừa click -> đích
      getRoute(coords, destination.coords);

      //Điền chữ "Vị trí đã chọn" vào ô input
      const input = document.querySelector(".mapboxgl-ctrl-geocoder--input");
      if (input) {
        input.value = `${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`;
      }
    };

    mapRef.current.on("click", handleClickMap);

    return () => {
      if (mapRef.current) mapRef.current.off("click", handleClickMap);
    };
  }, [isRouting, destination]);

  useEffect(() => {
    if (isRouting && geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = "";
      const startGeocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: "Nhập điểm xuất phát...",
        language: "vi",
        countries: "vn",
        flyTo: false,
      });
      startGeocoder.addTo(geocoderContainerRef.current);
      startGeocoder.on("result", (e) =>
        getRoute(e.result.center, destination.coords)
      );
    }
  }, [isRouting, destination]);

  const getRoute = async (start, end) => {
    if(tempMarkerRef.current) {
        tempMarkerRef.current.setLnglat(start);
    } else if(mapRef.current) {
        tempMarkerRef.current = new mapboxgl.Marker({ color: "black" })
            .setLngLat(start)
            .addTo(mapRef.current);
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
    try {
      const query = await fetch(url);
      const json = await query.json();
      if (!json.routes || json.routes.length === 0) {
        alert("Không tìm thấy đường đi!");
        return;
      }

      const data = json.routes[0];
      setRouteInfo({
        distance: (data.distance / 1000).toFixed(1) + " km",
        duration: (data.duration / 60).toFixed(0) + " phút",
      });

      if (mapRef.current && mapRef.current.getSource("route")) {
        mapRef.current.getSource("route").setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: data.geometry.coordinates,
          },
        });
        const bounds = new mapboxgl.LngLatBounds();
        data.geometry.coordinates.forEach((coord) => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          getRoute(userCoords, destination.coords);
          const input = document.querySelector(
            ".mapboxgl-ctrl-geocoder--input"
          );
          if (input) input.value = "Vị trí của tôi";
        },
        () => alert("Vui lòng cho phép truy cập vị trí.")
      );
    }
  };

  const handleStartNavigation = (item) => {
    setDestination(item);
    setIsRouting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        getRoute(
          [position.coords.longitude, position.coords.latitude],
          item.coords
        );
      });
    }
  };

  const handleBackToList = () => {
    setIsRouting(false);
    setRouteInfo(null);
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
    if (mapRef.current && mapRef.current.getSource("route")) {
      mapRef.current
        .getSource("route")
        .setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        });
    }
    mapRef.current.flyTo({ center: [105.854444, 21.028511], zoom: 12 });
  };

  const openPopup = (coords, props) => {
    const popups = document.getElementsByClassName("mapboxgl-popup");
    if (popups.length) popups[0].remove();

    const popupHTML = `
            <div style="font-family: sans-serif; padding:5px; width:200px">
                <img src="${props.image}" style="width:100%; height:100px; object-fit:cover; border-radius:4px; margin-bottom: 5px;" />    
                <h4 style="margin:5px 0;">${props.title}</h4>
                <p style="color:red; font-weight:bold;">${props.price}</p>
                <button id="btn-direct-popup" style="margin-top:5px; width:100%; padding:6px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">
                    🚗 Chỉ đường
                </button>
            </div>
        `;

    const popup = new mapboxgl.Popup({ offset: 10, closeButton: false })
      .setLngLat(coords)
      .setHTML(popupHTML)
      .addTo(mapRef.current);

    setTimeout(() => {
      const btn = document.getElementById("btn-direct-popup");
      if (btn)
        btn.onclick = () => {
          handleStartNavigation({ ...props, coords: coords });
          popup.remove();
        };
    }, 100);
  };

  const flyToLocation = (item) => {
    mapRef.current.flyTo({ center: item.coords, zoom: 14, speed: 1.5 });
    openPopup(item.coords, item);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "350px",
          display: "flex",
          flexDirection: "column",
          background: "#f8f9fa",
          borderRight: "1px solid #ddd",
          zIndex: 1,
        }}
      >
        {isRouting ? (
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <button
              onClick={handleBackToList}
              style={{
                marginBottom: "15px",
                cursor: "pointer",
                background: "none",
                border: "none",
                textAlign: "left",
                color: "#007bff",
              }}
            >
              ← Quay lại danh sách
            </button>
            <h3 style={{ margin: "0 0 15px 0" }}>Dẫn đường</h3>
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{ fontSize: "12px", fontWeight: "bold", color: "#666" }}
              >
                Điểm xuất phát:
              </label>
              <div ref={geocoderContainerRef} className="custom-geocoder"></div>
              <button
                onClick={handleUseMyLocation}
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  padding: "5px",
                  cursor: "pointer",
                  background: "#e9ecef",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                📍 Sử dụng vị trí của tôi
              </button>
            </div>
            <div
              style={{
                margin: "10px 0",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              ⬇
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{ fontSize: "12px", fontWeight: "bold", color: "#666" }}
              >
                Điểm đến:
              </label>
              <div
                style={{
                  padding: "10px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
              >
                {destination?.title}
              </div>
            </div>
            {routeInfo && (
              <div
                style={{
                  padding: "15px",
                  background: "#e3f2fd",
                  borderRadius: "8px",
                  border: "1px solid #90caf9",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1565c0",
                  }}
                >
                  {routeInfo.duration}
                </div>
                <div style={{ color: "#555" }}>
                  Khoảng cách: {routeInfo.distance}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "15px",
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
              }}
            >
              Kết quả tìm kiếm
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {REAL_ESTATE_DATA.map((item) => (
                <div
                  key={item.id}
                  onClick={() => flyToLocation(item)}
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{item.title}</div>
                  <div style={{ color: "#d32f2f" }}>{item.price}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    📍 Hà Nội
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div ref={mapContainerRef} style={{ flex: 1 }} />
    </div>
  );
};

export default MapboxExample;
