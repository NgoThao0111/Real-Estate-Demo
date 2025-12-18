import {
  Container,
  Spinner,
  Center,
  Text,
  Heading,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import HomePanel from "../components/HomePanel";
import HomePageFeature from "../components/HomePageFeature";
import HomePageSlideshow from "../components/HomePageSlideshow";
import { useListStore } from "../store/list.js";
// 1. Import Component MapboxMap & API
import MapboxMap from "../components/MapboxMap";
import api from "../lib/axios";

const HomePage = () => {
  const { listings, loading, error, fetchListings } = useListStore();

  // State chứa danh sách bài đăng dành riêng cho bản đồ (limit lớn)
  const [mapListings, setMapListings] = useState([]);

  const aosDuration = 800;
  const aosDelay = 50;
  
  // 1. Fetch Listing thường (cho danh sách hiển thị bên dưới)
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // 2. Fetch Map Data (cho bản đồ hiển thị bên trên)
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await api.get("/listings/getList?limit=1000");
        if (res.data && res.data.listings) {
          setMapListings(res.data.listings);
        }
      } catch (error) {
        console.error("Lỗi set data lên bản đồ: ", error);
      }
    };
    fetchMapData();
  }, []);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW={"1140px"} py={12}>
        <Center>
          <Text>{error}</Text>
        </Center>
      </Container>
    );
  }

  return (
    <>
      <Box 
        data-aos="fade-in" 
        data-aos-duration="100"
        mb={4}
      >
        <HomePanel />
      </Box>

      {/* --- SECTION SLIDESHOW BÀI ĐĂNG MỚI NHẤT --- */}
      {listings && listings.length > 0 && (
        <HomePageSlideshow listings={listings} />
      )}

      {/* --- SECTION BẢN ĐỒ KHÁM PHÁ --- */}
      <Box 
        bg="transparent"
        py={10}
        mb={4}
      >
        <Container maxW={"1140px"}>
          <Box
            h="600px"
            w="100%"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.200"
            position="relative"
            bg="transparent"
            data-aos="zoom-in"
            data-aos-duration={aosDuration}
            data-aos-delay={aosDelay + 50}
          >
            {/* Text overlay ở góc trên bên trái */}
            <Box
              position="absolute"
              top={4}
              left={4}
              zIndex={10}
              bg="transparent"
              px={4}
              py={3}
              borderRadius="lg"
              maxW="400px"
              data-aos="fade-up"
              data-aos-duration={aosDuration}
              data-aos-delay={aosDelay}
            >
              <Heading as="h3" size="lg" mb={2}>
                Bản đồ bất động sản
              </Heading>
            </Box>

            {/* QUAN TRỌNG: Luôn hiển thị bản đồ, bất kể có dữ liệu hay không */}
            <MapboxMap
              mode="explorer"
              // Logic: Ưu tiên mapListings > listings > mảng rỗng
              data={mapListings.length > 0 ? mapListings : listings || []}
              height="100%"
            />
          </Box>
        </Container>
      </Box>

      {/* Features section */}
      <HomePageFeature />
    </>
  );
};

export default HomePage;