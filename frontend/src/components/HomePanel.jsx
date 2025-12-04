import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  HStack,
  VStack,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
  Image,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Alert,
  AlertIcon,
  Flex
} from "@chakra-ui/react";
import { FiMapPin, FiStar } from "react-icons/fi";
import { useListStore } from "../store/list.js";
import { useNavigate } from "react-router-dom";

const HomePanel = () => {
  const { listings, fetchListings } = useListStore();
  const navigate = useNavigate();
  
  // Theme colors
  const contentBg = useColorModeValue("white", "gray.800");
  const bgGradient = useColorModeValue(
    "linear(to-b, white 10%, gray.50 90%)", 
    "linear(to-b, gray.900 10%, gray.800 90%)"
  );
  const tabActiveBg = useColorModeValue("white", "gray.700");
  const tabInactiveBg = useColorModeValue("whiteAlpha.500", "gray.600");
  
  // State management
  const [activeTab, setActiveTab] = useState(0); // 0 for sell, 1 for buy
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (import.meta.env.VITE_SKIP_API === 'true') return;
    fetchListings();
  }, [fetchListings]);

  // Generate location suggestions from listings
  const suggestions = Array.from(new Set(
    listings.map(item => item.location?.province || item.location?.ward || item.location?.detail)
      .filter(Boolean)
  )).slice(0, 8);

  const handleSelect = (value) => {
    setLocation(value);
    setShowSuggestions(false);
  };

  const handleSearch = (type) => {
    if (location.trim() === '') {
      setError('Vui lòng nhập địa điểm để tìm kiếm.');
      return;
    }
    setError('');
    
    const params = new URLSearchParams();
    params.set("location", location);
    params.set("type", type);
    navigate(`/listings?${params.toString()}`);
  };

  const renderSearchPanel = (type) => (
    <VStack spacing={6}>
      <Box position="relative" w="full">
        <InputGroup>
          <InputLeftElement>
            <Icon as={FiMapPin} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Tìm kiếm địa điểm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            size="lg"
            borderRadius="lg"
            bg="white"
            border="1px solid"
            borderColor={useColorModeValue("blue.100", "blue.700")}
            _placeholder={{ color: useColorModeValue("gray.400", "gray.600") }}
          />
        </InputGroup>

        {showSuggestions && suggestions.length > 0 && (
          <Box
            position="absolute"
            top="full"
            left={0}
            right={0}
            mt={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            zIndex={10}
            maxH="200px"
            overflowY="auto"
            boxShadow="lg"
          >
            <VStack align="stretch" spacing={0}>
              {suggestions.map((item, index) => (
                <Text
                  key={index}
                  cursor="pointer"
                  p={3}
                  _hover={{ bg: "blue.50", color: "blue.500" }}
                  onClick={() => handleSelect(item)}
                  borderBottom={index < suggestions.length - 1 ? "1px solid" : "none"}
                  borderBottomColor="gray.100"
                >
                  {item}
                </Text>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      <HStack spacing={4} w="full">
        <Button
          flex={1}
          size="lg"
          colorScheme="blue"
          onClick={() => handleSearch(type)}
          _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
          transition="all 0.2s"
        >
          Tìm kiếm
        </Button>
        <Button
          flex={1}
          size="lg"
          variant="outline"
          colorScheme="blue"
          onClick={() => handleSearch(type)}
          _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
          transition="all 0.2s"
        >
          Tìm kiếm nâng cao
        </Button>
      </HStack>

      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
    </VStack>
  );

  return (
    <Box
      position="relative"
      minH="100vh"
      pt={{ base: "80px", md: "100px" }}
      pb={{ base: "40px", md: "60px" }}
      overflow="hidden"
      bgGradient={useColorModeValue(
        "linear(to-br, white 10%, blue.100 50%, blue.100 100%)",
        "linear(to-br, gray.900 10%, blue.900 50%, blue.900 100%)"
      )}
    >
      {/* Background Image */}
      <Box
        position="absolute"
        bottom={0}
        left={600}
        w={{ base: "90%", md: "70%", lg: "65%" }}
        h={{ base: "90%", md: "85%", lg: "95%" }}
        zIndex={1}
      >
        <Image
          src="hero-image.png"
          alt="Real Estate Background"
          w="100%"
          h="100%"
          objectFit="contain"
          objectPosition="bottom right"
        />
      </Box>
      
      <Container maxW="1100px" position="absolute" zIndex={2}>
        <Flex direction={{ base: "column", lg: "row" }} align="start" minH="60vh">
          {/* Content */}
          <VStack 
            align={{ base: "center", lg: "start" }} 
            spacing={8} 
            flex={1}
            textAlign={{ base: "center", lg: "left" }}
            maxW={{ base: "100%", lg: "700px" }}
            mx="auto"
          >
            <VStack align="start" spacing={4}>
              <Heading 
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                lineHeight={1.2}
                color={useColorModeValue("rgba(1, 2, 24, 0.8)", "rgba(255, 255, 255, 0.8)")}
                fontWeight="bold"
                maxW="600px"
              >
                Tìm bất động sản tốt nhất của bạn
              </Heading>
              <Text 
                fontSize={{ base: "md", md: "lg" }}
                color={useColorModeValue("rgba(1, 2, 24, 0.8)", "whiteAlpha.800")}
                maxW="500px"
              >
                Khám phá hàng nghìn bất động sản chất lượng với giá tốt nhất thị trường
              </Text>
            </VStack>

            {/* Search Form */}
            <Box maxW="600px" w="full">
              <Tabs 
                index={activeTab} 
                onChange={setActiveTab}
                variant="soft-rounded"
                colorScheme="blue"
              >
                <TabList mb={0} bg="whiteAlpha.200" borderRadius="lg" p={1} justifyContent="flex-start">
                  <Tab
                    px={6}
                    py={3}
                    fontSize="lg"
                    fontWeight="semibold"
                    borderRadius="lg"
                    bg={activeTab === 0 ? "white" : "transparent"}
                    color={activeTab === 0 ? "blue.600" : useColorModeValue("blue.600", "whiteAlpha.800")}
                    _hover={{ 
                      bg: activeTab === 0 ? "white" : "whiteAlpha.200",
                      color: activeTab === 0 ? "blue.600" : "blue.800"
                    }}
                    transition="all 0.2s"
                  >
                    Bán
                  </Tab>
                  <Tab
                    px={6}
                    py={3}
                    fontSize="lg"
                    fontWeight="semibold"
                    borderRadius="lg"
                    bg={activeTab === 1 ? "white" : "transparent"}
                    color={activeTab === 1 ? "blue.600" : useColorModeValue("blue.600", "whiteAlpha.800")}
                    _hover={{ 
                      bg: activeTab === 1 ? "white" : "whiteAlpha.200",
                      color: activeTab === 1 ? "blue.600" : "blue.800"
                    }}
                    transition="all 0.2s"
                  >
                    Mua
                  </Tab>
                </TabList>

                <TabPanels 
                  bg={useColorModeValue("white", "blue.850")}
                  borderRadius="xl" 
                  mt={4}
                  shadow="2xl"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.800", "blue.700")}
                >
                  <TabPanel p={8}>
                    {renderSearchPanel("sell")}
                  </TabPanel>
                  <TabPanel p={8}>
                    {renderSearchPanel("buy")}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Rating Section */}
            <VStack 
              align={{ base: "center", lg: "start" }} 
              spacing={3}
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="2100"
            >
              <HStack 
                spacing={1}
                data-aos="zoom-in"
                data-aos-duration="600"
                data-aos-delay="200"
              >
                {[...Array(5)].map((_, i) => (
                  <Icon 
                    key={i} 
                    as={FiStar} 
                    w={5} 
                    h={5} 
                    color="blue.400" 
                    fill="currentColor"
                    data-aos="flip-left"
                    data-aos-duration="400"
                    data-aos-delay={(i * 10)}
                  />
                ))}
              </HStack>
              <Text 
                fontSize="md" 
                color={useColorModeValue("gray.700", "gray.300")}
                fontWeight="medium"
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="800"
              >
                <Text as="span" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
                  4.9/5
                </Text>
                <Text as="span" ml={2}>từ 658 đánh giá</Text>
              </Text>
            </VStack>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default HomePanel;