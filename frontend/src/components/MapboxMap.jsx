import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// --- CHAKRA & REACT IMPORTS ---
import { 
  Box, 
  Image, 
  Text, 
  Flex, 
  Badge, 
  IconButton, 
  useTheme 
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons"; 
import { Global, css } from "@emotion/react"; 
import { createRoot } from "react-dom/client"; 
import { useNavigate } from "react-router-dom";

// Lấy token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// =============================================================================
// 1. SUB-COMPONENT: ListingPopup (Đã Design lại đẹp hơn)
// =============================================================================
const ListingPopup = ({ item, onClose, onNavigate }) => {
  const imageUrl = item.images?.[0]?.url || "https://via.placeholder.com/150";
  const isVip = false; // Logic VIP tùy chỉnh

  return (
    <Flex
      w="340px"           // Tăng chiều rộng để thoáng hơn
      h="120px"           // Chiều cao cố định để cân đối
      bg="white" 
      borderRadius="2xl"  // Bo góc mạnh (2xl) cho hiện đại
      overflow="hidden" 
      boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" // Đổ bóng mềm mại hơn
      position="relative"
      onClick={() => onNavigate(item._id)}
      cursor="pointer"
      role="group"        // Để xử lý hover cho các phần tử con
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ 
        transform: "translateY(-2px)", // Nhấc nhẹ khi hover
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.15)"
      }}
      className="chakra-popup-card"
      fontFamily="body"
    >
      {/* Nút Close: Tinh tế hơn, nằm góc trên phải */}
      <IconButton
        aria-label="Close popup"
        icon={<CloseIcon />}
        size="xs"
        variant="ghost" // Dùng variant ghost để không bị thô
        position="absolute"
        top={3}
        right={4}
        zIndex={10}
        color="gray.400"
        _hover={{ bg: "red.50", color: "red.500" }} // Hover đỏ nhẹ
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* CỘT TRÁI: ẢNH */}
      <Box w="130px" h="100%" flexShrink={0} position="relative">
        <Image 
          src={imageUrl} 
          alt={item.title} 
          w="100%" h="100%" 
          objectFit="cover" 
        />
        {isVip && (
          <Badge 
            position="absolute" top={2} left={2} 
            colorScheme="yellow" variant="solid" fontSize="10px"
            boxShadow="md" px={2} borderRadius="md"
          >
            VIP
          </Badge>
        )}
      </Box>

      {/* CỘT PHẢI: THÔNG TIN */}
      <Flex direction="column" justify="space-between" p={3} flex={1} overflow="hidden">
        {/* Tiêu đề */}
        <Text 
          fontSize="15px" 
          fontWeight="700" 
          color="gray.800"
          noOfLines={2} 
          lineHeight="1.3" 
          title={item.title}
          mb={1}
          _groupHover={{ color: "blue.600" }} // Đổi màu title khi hover cả card
          transition="color 0.2s"
        >
          {item.title}
        </Text>

        {/* Giá và Diện tích */}
        <Flex align="flex-end" justify="space-between" w="100%">
          <Text color="red.500" fontWeight="800" fontSize="17px" lineHeight="1">
            {item.price || "Liên hệ"}
          </Text>
          
          <Flex align="center" color="gray.500" fontSize="13px" fontWeight="medium">
            {/* Icon thước đo diện tích (SVG) */}
            <Box as="span" mr={1} display="flex" alignItems="center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18"></path>
                    <path d="M4 10h16"></path>
                </svg>
            </Box>
            {item.area ? `${item.area} m²` : ""}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

// =============================================================================
// 2. MAIN COMPONENT: MapboxMap
// =============================================================================
const MapboxMap = ({
  mode = "view", // "view" | "picker" | "explorer"
  data = [],
  initialCoords = [105.854444, 21.028511], // Hà Nội
  onLocationSelect,
  height = "400px",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const markersArrayRef = useRef([]); // Lưu trữ các marker html
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // --- GLOBAL STYLES (Thay thế file mb.css) ---
  const GlobalStyles = css`
    /* 1. Ghi đè Popup mặc định của Mapbox */
    .mapboxgl-popup-content {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    .mapboxgl-popup-close-button {
      display: none !important;
    }
    /* Chỉnh mũi tên (tip) cho khớp với popup mới */
    .mapboxgl-popup-tip {
      border-top-color: white !important; 
      margin-top: -1px;
    }

    /* 2. Style cho Marker Giá Tiền */
    .price-marker {
      background-color: var(--chakra-colors-gray-900);
      color: white;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 99px; /* Bo tròn kiểu pill cho hiện đại */
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      border: 2px solid white; /* Thêm viền trắng cho nổi bật trên bản đồ */
      white-space: nowrap;
      
      /* Căn chỉnh */
      width: fit-content;
      display: flex;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Hiệu ứng nảy */
    }

    /* Hover effect */
    .price-marker:hover {
      background-color: var(--chakra-colors-red-500);
      border-color: white;
      transform: scale(1.15);
      z-index: 100;
    }

    /* Mũi tên nhỏ bên dưới marker */
    .price-marker::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: var(--chakra-colors-gray-900) transparent transparent transparent;
      transition: border-color 0.2s ease;
    }
    .price-marker:hover::after {
      border-color: var(--chakra-colors-red-500) transparent transparent transparent;
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
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
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

  // --- HANDLE MODES ---
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    cleanUp();

    if (mode === "picker") setupPickerMode();
    else if (mode === "view") setupViewMode();
    else if (mode === "explorer") setupExplorerMode();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, mode, JSON.stringify(initialCoords), JSON.stringify(data)]);

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
    // Clean up explorer markers
    if (markersArrayRef.current.length > 0) {
        markersArrayRef.current.forEach(marker => marker.remove());
        markersArrayRef.current = [];
    }
  };

  // --- MODE: PICKER ---
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

    markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#E53935" })
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
    if (onLocationSelect) onLocationSelect(lng, lat, address);
  };

  // --- MODE: VIEW ---
  const setupViewMode = () => {
    markerRef.current = new mapboxgl.Marker({ color: "#E53935" })
      .setLngLat(initialCoords)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h6>Vị trí BĐS</h6>"))
      .addTo(mapRef.current);
    mapRef.current.flyTo({ center: initialCoords, zoom: 14 });
  };

  // --- MODE: EXPLORER ---
  const setupExplorerMode = () => {
    if (!data || data.length === 0) return;

    const validListings = data.filter(
      (item) =>
        item.location?.coords?.coordinates?.length === 2
    );

    validListings.forEach((item) => {
      // 1. Tạo HTML Element cho Marker Giá
      const el = document.createElement("div");
      el.className = "price-marker"; 
      el.innerText = item.price || "LH";

      // 2. Tạo Marker Mapbox
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
        offset: [0, -5],
      })
        .setLngLat(item.location.coords.coordinates)
        .addTo(mapRef.current);

      // 3. Sự kiện Click Marker -> Render Popup React
      el.addEventListener("click", (e) => {
        e.stopPropagation();

        const popups = document.getElementsByClassName("mapboxgl-popup");
        if (popups.length) popups[0].remove();

        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        // Render ListingPopup
        root.render(
            <ListingPopup 
                item={item}
                onClose={() => {
                    marker.getPopup().remove(); 
                }}
                onNavigate={(id) => {
                    navigate(`/listings/${id}`);
                }}
            />
        );

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: "360px", // Tăng max width để vừa với card mới
          offset: 15 
        })
        .setDOMContent(popupNode);

        marker.setPopup(popup);
        marker.togglePopup();

        popup.on('close', () => {
             setTimeout(() => root.unmount(), 0);
        });
      });

      markersArrayRef.current.push(marker);
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