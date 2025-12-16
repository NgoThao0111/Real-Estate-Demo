import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Global, css } from "@emotion/react";

import ListingPopup from "./ListingPopup.jsx";

const MapboxMap = ({
  mode = "view",
  data = [],
  initialCoords = [105.854444, 21.028511],
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

  /* =======================
     1️⃣ SET MAPBOX TOKEN
     ======================= */
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    console.log("ENV:", import.meta.env);
    if (!token) {
      console.error("❌ VITE_MAPBOX_TOKEN is missing");
      return;
    }
    mapboxgl.accessToken = token;
  }, []);

  /* =======================
     2️⃣ GLOBAL STYLES
     ======================= */
  const GlobalStyles = css`
    .mapboxgl-popup-content {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .mapboxgl-popup-close-button {
      display: none !important;
    }
    .mapboxgl-marker {
      cursor: pointer;
    }
    .mapboxgl-marker:hover svg {
      transform: scale(1.3);
      transition: transform 0.2s ease;
    }
  `;

  /* =======================
     3️⃣ INIT MAP
     ======================= */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!mapboxgl.accessToken) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoords,
      zoom: mode === "explorer" ? 10 : 13,
    });

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* =======================
     4️⃣ CLEANUP
     ======================= */
  const cleanUp = () => {
    markerRef.current?.remove();
    markerRef.current = null;

    markersArrayRef.current.forEach((m) => m.remove());
    markersArrayRef.current = [];

    if (geocoderRef.current) {
      mapRef.current.removeControl(geocoderRef.current);
      geocoderRef.current = null;
    }

    if (directionsRef.current) {
      mapRef.current.removeControl(directionsRef.current);
      directionsRef.current = null;
    }

    if (geolocateRef.current) {
      mapRef.current.removeControl(geolocateRef.current);
      geolocateRef.current = null;
    }
  };

  /* =======================
     5️⃣ MODE HANDLER
     ======================= */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    cleanUp();

    if (mode === "picker") setupPickerMode();
    if (mode === "view") setupViewMode();
    if (mode === "explorer") setupExplorerMode();
    if (mode === "directions") setupDirectionsMode();
  }, [isMapLoaded, mode, JSON.stringify(data), JSON.stringify(initialCoords)]);

  /* =======================
     MODES
     ======================= */
  const setupPickerMode = () => {
    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      countries: "vn",
    });

    mapRef.current.addControl(geocoderRef.current, "top-left");

    geocoderRef.current.on("result", (e) => {
      const [lng, lat] = e.result.center;
      onLocationSelect?.(lng, lat, e.result.place_name);
    });
  };

  const setupViewMode = () => {
    markerRef.current = new mapboxgl.Marker({ color: "#E53935" })
      .setLngLat(initialCoords)
      .addTo(mapRef.current);
  };

  const setupExplorerMode = () => {
    data.forEach((item) => {
      if (!item.location?.coords?.coordinates) return;

      const marker = new mapboxgl.Marker({ color: "#E53935" })
        .setLngLat(item.location.coords.coordinates)
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        root.render(
          <ListingPopup
            item={item}
            onNavigate={(id) => navigate(`/listings/${id}`)}
          />
        );

        const popup = new mapboxgl.Popup({ closeButton: false })
          .setDOMContent(popupNode);

        marker.setPopup(popup).togglePopup();
        popup.on("close", () => root.unmount());
      });

      markersArrayRef.current.push(marker);
    });
  };

  const setupDirectionsMode = () => {
    directionsRef.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      language: "vi",
    });

    mapRef.current.addControl(directionsRef.current, "top-left");
    directionsRef.current.setDestination(initialCoords);
  };

  /* =======================
     RENDER
     ======================= */
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
      />
    </>
  );
};

export default MapboxMap;
