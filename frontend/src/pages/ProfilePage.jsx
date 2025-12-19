import {
  Box,
  Flex,
  VStack,
  HStack,
  Avatar,
  Text,
  Heading,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Divider,
  Badge
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaUser, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { useListStore } from "../store/list";
import ListingCard from "../components/ListingCard";
import AOS from "aos";
import "aos/dist/aos.css";
 
const ProfilePage = () => {
  const { currentUser } = useAuthContext();
  const { fetchUserListings } = useListStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
 
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mainBg = useColorModeValue("gray.50", "gray.900");
 
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadListings();
  }, []);
 
  const loadListings = async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    const res = await fetchUserListings(currentUser._id);
    if (res.success) {
      setListings(res.data || []);
    }
    setLoading(false);
  };
 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
 
  // Filter listings by type
  const allListings = listings;
  const forSaleListings = listings.filter(l => l.type === "Đang bán");
  const forRentListings = listings.filter(l => l.type === "Cho thuê");
  const hiddenListings = listings.filter(l => l.isHidden);
 
  const getListingsByTab = (tabIndex) => {
    switch(tabIndex) {
      case 0: return allListings;
      case 1: return forSaleListings;
      case 2: return forRentListings;
      case 3: return hiddenListings;
      default: return allListings;
    }
  };
 
  const currentListings = getListingsByTab(activeTab);
 
  // Sidebar Component
  const Sidebar = () => (
    <Box
      w={isSidebarOpen ? "320px" : "0px"}
      bg={bgColor}
      borderRight={isSidebarOpen ? "1px" : "0"}
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      data-aos="fade-right"
      backgroundImage="url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800')"
      backgroundSize="cover"
      backgroundPosition="center"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "blackAlpha.700",
        zIndex: 0
      }}
    >
      <Box
        position="relative"
        zIndex={1}
        p={isSidebarOpen ? 6 : 0}
        h="full"
        overflowY="auto"
      >
        <VStack
          spacing={4}
          align="center"
          opacity={isSidebarOpen ? 1 : 0}
          transition="opacity 0.3s ease"
          py={4}
        >
          <Avatar
            size="xl"
            name={currentUser?.username}
            bg="pink.500"
            color="white"
            fontSize="3xl"
            border="4px solid"
            borderColor="whiteAlpha.300"
          />
         
          <Heading size="md" color="white" textAlign="center">
            {currentUser?.username || "User"}
          </Heading>
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
            Thành viên
          </Badge>
 
          <Divider borderColor="whiteAlpha.400" />
 
          <VStack spacing={3} align="stretch" w="full">
            <HStack>
              <Icon as={FaUser} color="blue.300" boxSize={4} />
              <Text fontWeight="semibold" color="whiteAlpha.700" fontSize="xs">
                HỌ VÀ TÊN
              </Text>
            </HStack>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              {currentUser?.username || "N/A"}
            </Text>
 
            <HStack mt={2}>
              <Icon as={FaPhone} color="green.300" boxSize={4} />
              <Text fontWeight="semibold" color="whiteAlpha.700" fontSize="xs">
                SỐ ĐIỆN THOẠI
              </Text>
            </HStack>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              {currentUser?.phone || "N/A"}
            </Text>
 
            <HStack mt={2}>
              <Icon as={FaEnvelope} color="purple.300" boxSize={4} />
              <Text fontWeight="semibold" color="whiteAlpha.700" fontSize="xs">
                EMAIL
              </Text>
            </HStack>
            <Text
              fontWeight="semibold"
              color="white"
              fontSize="sm"
              wordBreak="break-word"
            >
              {currentUser?.email || "N/A"}
            </Text>
          </VStack>
 
          <Divider borderColor="whiteAlpha.400" />
 
          <Box
            bg="whiteAlpha.200"
            p={3}
            rounded="lg"
            w="full"
            textAlign="center"
            backdropFilter="blur(10px)"
          >
            <Text fontSize="xs" color="whiteAlpha.800" mb={1}>
              Tổng bài đăng
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.300">
              {listings.length}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
 
  // Profile Detail View Component
  const ProfileDetailView = () => (
    <Box flex={1} bg={mainBg} p={12} overflowY="auto" position="relative">
      {/* Toggle Button */}
      <IconButton
        icon={<FaChevronRight />}
        position="fixed"
        left="20px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1000}
        size="md"
        rounded="full"
        colorScheme="blue"
        onClick={toggleSidebar}
        transition="all 0.3s ease"
        shadow="lg"
      />
 
      <VStack spacing={8} align="center" maxW="700px" mx="auto" mt={12} data-aos="fade-in">
        <Avatar
          size="2xl"
          name={currentUser?.username}
          bg="pink.500"
          color="white"
          fontSize="6xl"
          w="200px"
          h="200px"
        />
       
        <Heading size="2xl">{currentUser?.username || "User"}</Heading>
        <Badge colorScheme="blue" fontSize="lg" px={4} py={2}>Thành viên</Badge>
 
        <Divider w="full" />
 
        <Box w="full" bg={bgColor} p={8} rounded="xl" shadow="lg">
          <VStack spacing={8} align="stretch">
            <Box>
              <HStack mb={3}>
                <Icon as={FaUser} color="blue.500" boxSize={6} />
                <Text fontWeight="bold" color="gray.500" fontSize="lg">HỌ VÀ TÊN</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="semibold" ml={10}>
                {currentUser?.username || "N/A"}
              </Text>
            </Box>
 
            <Divider />
 
            <Box>
              <HStack mb={3}>
                <Icon as={FaPhone} color="green.500" boxSize={6} />
                <Text fontWeight="bold" color="gray.500" fontSize="lg">SỐ ĐIỆN THOẠI</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="semibold" ml={10}>
                {currentUser?.phone || "N/A"}
              </Text>
            </Box>
 
            <Divider />
 
            <Box>
              <HStack mb={3}>
                <Icon as={FaEnvelope} color="purple.500" boxSize={6} />
                <Text fontWeight="bold" color="gray.500" fontSize="lg">EMAIL</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="semibold" ml={10}>
                {currentUser?.email || "N/A"}
              </Text>
            </Box>
          </VStack>
        </Box>
 
        <Divider w="full" />
 
        <Box textAlign="center" bg={bgColor} p={6} rounded="xl" shadow="md" w="full">
          <Heading size="lg" color="gray.600" mb={3}>Tổng số bài đăng</Heading>
          <Text fontSize="5xl" fontWeight="bold" color="blue.500">
            {listings.length}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
 
  // Listings View Component
  const ListingsView = () => (
    <Box flex={1} bg={mainBg} p={8} overflowY="auto" position="relative">
      {/* Toggle Button */}
      <IconButton
        icon={<FaChevronLeft />}
        position="fixed"
        left="300px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1000}
        size="md"
        rounded="full"
        colorScheme="blue"
        onClick={toggleSidebar}
        transition="all 0.3s ease"
        shadow="lg"
      />
 
      <Heading size="xl" mb={6} textAlign="center">
        Bài đăng
      </Heading>
 
      <Tabs
        isFitted
        variant="soft-rounded"
        colorScheme="blue"
        index={activeTab}
        onChange={setActiveTab}
      >
        <TabList mb={6} bg={bgColor} p={2} rounded="lg" shadow="sm">
          <Tab>Tất cả</Tab>
          <Tab>Chưa thuê/mua</Tab>
          <Tab>Đã thuê/mua</Tab>
        </TabList>
 
        <TabPanels>
          <TabPanel>
            <ListingsGrid listings={currentListings} />
          </TabPanel>
          <TabPanel>
            <ListingsGrid listings={currentListings} />
          </TabPanel>
          <TabPanel>
            <ListingsGrid listings={currentListings} />
          </TabPanel>
          <TabPanel>
            <ListingsGrid listings={currentListings} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
 
  const ListingsGrid = ({ listings }) => {
    if (listings.length === 0) {
      return (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">
            Chưa có bài đăng nào
          </Text>
        </Box>
      );
    }
 
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {listings.map((listing, index) => (
          <Box key={listing._id} data-aos="fade-up" data-aos-delay={index * 60}>
            <ListingCard listing={listing} />
          </Box>
        ))}
      </SimpleGrid>
    );
  };
 
  return (
    <Flex minH="100vh" bg={mainBg}>
      <Sidebar />
      {isSidebarOpen ? <ListingsView /> : <ProfileDetailView />}
    </Flex>
  );
};
 
export default ProfilePage;
 
 