import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  IconButton,
  useColorModeValue,
  Flex,
  Image,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiMapPin, FiHome, FiArrowRight } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const HomePageSlideshow = ({ listings }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState("right");
  const navigate = useNavigate();

  // Color mode values
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const headerText = useColorModeValue("blue.600", "blue.200");
  const buttonBg = useColorModeValue("blue.500", "blue.400");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.500");

  // Lấy 3 bài đăng gần nhất
  const getTopThree = (items) => {
    if (!items || items.length === 0) return [];
    
    // Sắp xếp theo createdAt nếu có
    if (items.some((it) => it.createdAt)) {
      return [...items]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    }
    return items.slice(0, 3);
  };

  const slideListings = getTopThree(listings);

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlaying || slideListings.length === 0) return;
    
    const interval = setInterval(() => {
      setSlideDirection("right");
      setCurrentSlide((prev) => (prev + 1) % slideListings.length);
    }, 6000); // Chuyển slide mỗi 6 giây

    return () => clearInterval(interval);
  }, [isAutoPlaying, slideListings.length]);

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setSlideDirection("left");
    setCurrentSlide((prev) => (prev - 1 + slideListings.length) % slideListings.length);
  };

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setSlideDirection("right");
    setCurrentSlide((prev) => (prev + 1) % slideListings.length);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setSlideDirection(index > currentSlide ? "right" : "left");
    setCurrentSlide(index);
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!slideListings || slideListings.length === 0) {
    return null;
  }

  const currentListing = slideListings[currentSlide];
  const imageUrl = currentListing?.images?.[0]?.url || currentListing?.images?.[0] || "/placeholder.jpg";

  // Debug logging
  console.log("Current listing:", currentListing);
  console.log("Image URL:", imageUrl);
  console.log("Slide listings:", slideListings);

  return (
    <Box 
      bg="transparent"
      py={16}
      position="relative"
      overflow="visible"
    >
      <Container maxW={"1140px"} position="relative">
        {/* Slideshow Container - với 3 layers */}
        <Box
          position="relative"
          minH={{ base: "400px", lg: "450px" }}
          h={{ base: "auto", lg: "450px" }}
          mb={12}
        >
          {/* Layer 1: Khối trang trí xanh dương ở dưới cùng */}
          <Box
            position="absolute"
            top={{ base: "auto", lg: "20px" }}
            bottom={{ base: "-30px", lg: "auto" }}
            right={{ base: "-30px", lg: "0" }}
            w={{ base: "55%", lg: "650px" }}
            h={{ base: "250px", lg: "480px" }}
            bg="blue.500"
            zIndex={1}
            overflow="hidden"
          >
            {/* Animated squares decoration - nhiều khối nhỏ hơn chuyển động nhanh hơn */}
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              w="80px"
              h="80px"
              bg="blue.300"
              opacity={0.3}
              animation="float 3s ease-in-out infinite"
              sx={{
                '@keyframes float': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(-20px, 20px) rotate(10deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="30px"
              right="90px"
              w="50px"
              h="50px"
              bg="blue.200"
              opacity={0.25}
              animation="float2 3.5s ease-in-out infinite"
              sx={{
                '@keyframes float2': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(15px, -15px) rotate(-8deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="100px"
              right="10px"
              w="40px"
              h="40px"
              bg="white"
              opacity={0.15}
              animation="float3 2.8s ease-in-out infinite"
              sx={{
                '@keyframes float3': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(-10px, 10px) rotate(5deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="5px"
              right="150px"
              w="60px"
              h="60px"
              bg="blue.400"
              opacity={0.2}
              animation="float4 4s ease-in-out infinite"
              sx={{
                '@keyframes float4': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(20px, -25px) rotate(-12deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="60px"
              right="200px"
              w="35px"
              h="35px"
              bg="blue.100"
              opacity={0.3}
              animation="float5 3.2s ease-in-out infinite"
              sx={{
                '@keyframes float5': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(-15px, 15px) rotate(7deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="140px"
              right="120px"
              w="45px"
              h="45px"
              bg="blue.300"
              opacity={0.22}
              animation="float6 3.6s ease-in-out infinite"
              sx={{
                '@keyframes float6': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(18px, -20px) rotate(-10deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="180px"
              right="50px"
              w="55px"
              h="55px"
              bg="white"
              opacity={0.18}
              animation="float7 4.2s ease-in-out infinite"
              sx={{
                '@keyframes float7': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(-12px, 12px) rotate(6deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="45px"
              right="240px"
              w="38px"
              h="38px"
              bg="blue.200"
              opacity={0.28}
              animation="float8 2.5s ease-in-out infinite"
              sx={{
                '@keyframes float8': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(10px, -18px) rotate(-9deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="120px"
              right="180px"
              w="42px"
              h="42px"
              bg="blue.400"
              opacity={0.24}
              animation="float9 3.8s ease-in-out infinite"
              sx={{
                '@keyframes float9': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(-16px, 16px) rotate(11deg)' },
                },
              }}
            />
            <Box
              position="absolute"
              top="85px"
              right="60px"
              w="32px"
              h="32px"
              bg="blue.100"
              opacity={0.26}
              animation="float10 3.3s ease-in-out infinite"
              sx={{
                '@keyframes float10': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '50%': { transform: 'translate(14px, -14px) rotate(-7deg)' },
                },
              }}
            />
          </Box>

          {/* Layer 2: Khối hình ảnh bên trái - đặt cao hơn */}
          <Box
            position={{ base: "relative", lg: "absolute" }}
            top={{ base: 0, lg: 0 }}
            left={{ base: 0, lg: 0 }}
            w={{ base: "100%", lg: "60%" }}
            h={{ base: "300px", lg: "400px" }}
            overflow="hidden"
            zIndex={2}
            boxShadow="xl"
            bg="gray.200"
            key={`image-${currentSlide}`}
            animation={`${slideDirection === "right" ? slideInFromLeft : slideInFromRight} 0.6s ease-out`}
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={currentListing?.title || "Property"}
                w="100%"
                h="100%"
                objectFit="cover"
                loading="eager"
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  e.target.src = "https://via.placeholder.com/800x600?text=No+Image";
                }}
              />
            )}
            {!imageUrl && (
              <Box
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.300"
                color="gray.600"
                fontSize="lg"
              >
                Không có hình ảnh
              </Box>
            )}
            {/* Overlay gradient */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="50%"
              bgGradient={useColorModeValue(
                "linear(to-t, blackAlpha.600, transparent)",
                "linear(to-t, blackAlpha.800, transparent)"
              )}
            />
          </Box>

          {/* Layer 3: Khối nội dung văn bản bên phải - thấp hơn khối ảnh */}
          <Box
            position={{ base: "relative", lg: "absolute" }}
            top={{ base: 0, lg: "150px" }}
            right={{ base: 0, lg: "40px" }}
            w={{ base: "100%", lg: "42%" }}
            minH={{ base: "auto", lg: "450px" }}
            bg={bg}
            boxShadow="2xl"
            p={{ base: 6, md: 8 }}
            zIndex={3}
            key={`content-${currentSlide}`}
            animation={`${slideDirection === "right" ? slideInFromRight : slideInFromLeft} 0.6s ease-out`}
          >
            {/* Title */}
            <Heading
              as="h3"
              size={{ base: "lg", md: "xl" }}
              color={textColor}
              mb={6}
              fontWeight="bold"
              lineHeight="1.3"
            >
              {currentListing?.title || "Bất động sản cao cấp"}
            </Heading>

            {/* Description */}
            <Text
              color={subTextColor}
              mb={6}
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.8"
            >
              {currentListing?.description || 
                "1932年創業、現在グローバルカンパニーとして海外売上比率8割、外国人社員比率7割。トプコンの理念、概要、歴史などを紹介します。"}
            </Text>

            {/* Property Details with Location */}
            <VStack align="flex-start" spacing={3} mb={6}>
              <HStack spacing={2} color={subTextColor}>
                <FiMapPin />
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {currentListing?.address || "Đang cập nhật"}
                </Text>
              </HStack>
              
              <HStack spacing={6} flexWrap="wrap">
                {currentListing?.propertyType && (
                  <HStack spacing={2}>
                    <FiHome color={headerText} />
                    <Text fontSize="sm" color={textColor} fontWeight="medium">
                      {currentListing.propertyType}
                    </Text>
                  </HStack>
                )}
                {currentListing?.area && (
                  <Text fontSize="sm" color={textColor} fontWeight="medium">
                    {currentListing.area} m²
                  </Text>
                )}
              </HStack>
            </VStack>

            {/* Price */}
            <Heading
              as="h4"
              size="lg"
              color={buttonBg}
              mb={4}
              fontWeight="bold"
            >
              {formatPrice(currentListing?.price)}
            </Heading>
          </Box>

          {/* Navigation Buttons */}
          <IconButton
            icon={<FiChevronLeft />}
            onClick={handlePrevSlide}
            position="absolute"
            left={{ base: 2, lg: 4 }}
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            colorScheme="blue"
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            size="lg"
            borderRadius="full"
            aria-label="Previous slide"
          />
          <IconButton
            icon={<FiChevronRight />}
            onClick={handleNextSlide}
            position="absolute"
            right={{ base: 2, lg: 4 }}
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            colorScheme="blue"
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            size="lg"
            borderRadius="full"
            aria-label="Next slide"
          />
        </Box>

        {/* Dots Indicator */}
        <HStack justify="center" mt={6} spacing={3}>
          {slideListings.map((_, index) => (
            <Box
              key={index}
              w={currentSlide === index ? "32px" : "12px"}
              h="12px"
              bg={currentSlide === index ? buttonBg : "gray.300"}
              borderRadius="full"
              cursor="pointer"
              onClick={() => handleDotClick(index)}
              transition="all 0.3s"
              _hover={{ bg: currentSlide === index ? buttonHoverBg : "gray.400" }}
            />
          ))}
        </HStack>
      </Container>
    </Box>
  );
};

export default HomePageSlideshow;
