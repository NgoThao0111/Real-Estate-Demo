import {
  Container,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  Heading,
  Box,
  Button,
  useColorModeValue,
  IconButton,
  HStack,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { FiUsers, FiGrid, FiCheckCircle, FiChevronLeft, FiChevronRight, FiMapPin, FiHome } from "react-icons/fi";
import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import HomePanel from "../components/HomePanel";
import { useListStore } from "../store/list.js";
import { useNavigate } from "react-router-dom";
// 1. Import Component MapboxMap & API
import MapboxMap from "../components/MapboxMap";
import api from "../lib/axios";

const HomePage = () => {
  const { listings, loading, error, fetchListings } = useListStore();
  const navigate = useNavigate();

  // State chứa danh sách bài đăng dành riêng cho bản đồ (limit lớn)
  const [mapListings, setMapListings] = useState([]);

  const contentBg = useColorModeValue("white", "gray.800");
  const subText = useColorModeValue("gray.600", "white");
  const cardShadow = useColorModeValue("lg", "dark-lg");
  const getSectionBg = (index) =>
    index % 2 === 0
      ? useColorModeValue("white", "gray.800")
      : useColorModeValue("gray.100", "gray.900");
  const aosDuration = 800;
  const aosDelay = 50;
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
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
  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlaying || !listings || listings.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(3, listings.length));
    }, 5000); // Chuyển slide mỗi 5 giây

    return () => clearInterval(interval);
  }, [isAutoPlaying, listings]);

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + Math.min(3, listings.length)) % Math.min(3, listings.length));
  };

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % Math.min(3, listings.length));
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

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

      {/* --- SECTION DANH SÁCH BÀI ĐĂNG --- */}
      <Box 
        bg={getSectionBg(1)} 
        py={10}
        borderRadius="xl"
        shadow={cardShadow}
        mb={4}
      >
        <Container
          maxW={"1140px"}
          textAlign="left"
          data-aos="fade-up"
          data-aos-duration={aosDuration}
          data-aos-delay={aosDelay}
        >
          <Heading as="h2" size="lg" mb={2}>
            Khám phá các bài đăng mới nhất
          </Heading>
          <Text color={subText}>
            Tổng hợp các bài đăng nhà đất, căn hộ và đất nền được tuyển chọn.
          </Text>
        </Container>

        <Container maxW={"1140px"} py={8}>
          {!listings || listings.length === 0 ? (
            <Center>
              <Text>Chưa có bài đăng nào.</Text>
            </Center>
          ) : (
            (() => {
              const getTopThree = (items) => {
                if (!items || items.length === 0) return [];
                const rankFields = ["score", "rating", "views"];
                for (const f of rankFields) {
                  if (
                    items.some((it) => it[f] !== undefined && it[f] !== null)
                  ) {
                    return [...items]
                      .sort((a, b) => (b[f] || 0) - (a[f] || 0))
                      .slice(0, 6);
                  }
                }
                if (items.some((it) => it.createdAt)) {
                  return [...items]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .slice(0, 6);
                }
                return items.slice(0, 6);
              };

              const top = getTopThree(listings);

              return (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                  {top.map((l, index) => (
                    <Box
                      key={l._id || l.id}
                      data-aos="fade-up"
                      data-aos-duration={aosDuration}
                      data-aos-delay={aosDelay + index * 100}
                    >
                      <ListingCard listing={l} />
                    </Box>
                  ))}
                </SimpleGrid>
              );
            })()
          )}
        </Container>
        <Box
          textAlign="center"
          data-aos="fade-up"
          data-aos-duration={aosDuration / 2}
          data-aos-delay={aosDelay}
        >
          <Button
            size="lg"
            colorScheme="blue"
            variant="outline"
            onClick={() => navigate("/listings")}
            data-aos="pulse"
            data-aos-duration={aosDuration / 2}
            data-aos-delay={aosDelay}
          >
            Xem tất cả bài đăng
          </Button>
        </Box>
      </Box>

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
      <Box 
        bg="transparent"
        py={10}
        borderRadius="xl"
        mb={4}
        overflow="hidden"
        position="relative"
      >
        {/* Animated Text Background */}
        <Box
          position="absolute"
          top="-50px"
          left="0"
          width="200%"
          overflow="hidden"
          pointerEvents="none"
          zIndex={100}
          opacity={1}
          sx={{
            '@keyframes scrollText': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' }
            }
          }}
        >
          <Text
            fontSize={{ base: "80px", md: "120px", lg: "150px" }}
            fontWeight="900"
            color={useColorModeValue("blue.400", "blue.300")}
            whiteSpace="nowrap"
            animation="scrollText 20s linear infinite"
            sx={{
              textShadow: useColorModeValue(
                "0 2px 10px rgba(59, 130, 246, 0.3)",
                "0 2px 10px rgba(96, 165, 250, 0.5)"
              )
            }}
          >
            RealEstate Demo RealEstate Demo RealEstate Demo RealEstate Demo
          </Text>
        </Box>

        <Container
          maxW={"1140px"}
          mt={6}
          mb={12}
          position="relative"
          zIndex={5}
          data-aos="fade-up"
          data-aos-duration={aosDuration}
          data-aos-delay={aosDelay}
        >
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
            {/* Left Side - Features */}
            <Box>
              <Box
                textAlign="left"
                mb={8}
                data-aos="fade-right"
                data-aos-duration={aosDuration}
                data-aos-delay={aosDelay}
              >
                <Heading
                  as="h3"
                  size="xl"
                  mb={3}
                  data-aos="zoom-in"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay}
                >
                  Tại sao chọn RealEstate Demo?
                </Heading>
                <Text
                  color={subText}
                  fontSize="lg"
                  data-aos="fade-up"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay + 50}
                >
                  Đối tác tin cậy giúp bạn tìm bất động sản phù hợp.
                </Text>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                gap={6}
              >
                <Box
                  display="flex"
                  alignItems="start"
                  gap={4}
                  data-aos="fade-right"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay + 100}
                >
                  <Box
                    minW="56px"
                    h="56px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiGrid size={24} color="#2B6CB0" />
                  </Box>
                  <Box>
                    <Heading as="h4" size="md" mb={2}>
                      Nguồn lựa chọn đa dạng
                    </Heading>
                    <Text color={subText} fontSize="sm">
                      Hàng nghìn tin đăng đã được kiểm duyệt, dễ dàng tìm được bất
                      động sản phù hợp.
                    </Text>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="start"
                  gap={4}
                  data-aos="fade-right"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay + 200}
                >
                  <Box
                    minW="56px"
                    h="56px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiCheckCircle size={24} color="#2B6CB0" />
                  </Box>
                  <Box>
                    <Heading as="h4" size="md" mb={2}>
                      Quy trình liền mạch
                    </Heading>
                    <Text color={subText} fontSize="sm">
                      Ứng dụng công nghệ giúp trải nghiệm mua bán, thuê mướn trở nên
                      suôn sẻ.
                    </Text>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="start"
                  gap={4}
                  data-aos="fade-right"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay + 300}
                >
                  <Box
                    minW="56px"
                    h="56px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiUsers size={24} color="#2B6CB0" />
                  </Box>
                  <Box>
                    <Heading as="h4" size="md" mb={2}>
                      Chuyên gia môi giới
                    </Heading>
                    <Text color={subText} fontSize="sm">
                      Đội ngũ tư vấn chuyên nghiệp đồng hành cùng bạn trong mọi bước.
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right Side - Image */}
            <Box
              data-aos="fade-left"
              data-aos-duration={aosDuration}
              data-aos-delay={aosDelay + 200}
              display={{ base: "none", lg: "block" }}
            >
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                position="relative"
                height="500px"
              >
                <Box
                  as="img"
                  src="/anh-3.jpg"
                  alt="Real Estate Demo"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "scale(1.05)" }}
                />
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;