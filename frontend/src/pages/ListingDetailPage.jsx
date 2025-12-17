import {
  Container,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Center,
  Text,
  Box,
  Heading,
  VStack,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListStore } from "../store/list.js";
import { useUserStore } from "../store/user.js";
import { useChatStore } from "../store/chat.js";
import ListingImageSection from "../components/ListingImageSection.jsx";
import ListingInfoSection from "../components/ListingInfoSection.jsx";
// 1. Import Component MapboxMap
import MapboxMap from "../components/MapboxMap.jsx";
import { FaDirections, FaMapMarkerAlt } from "react-icons/fa";

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getListingById } = useListStore();
  const { user } = useUserStore();
  const { createOrFindConversation } = useChatStore();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const [mapMode, setMapMode] = useState("view");

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      setLoading(true);
      const res = await getListingById(id);
      if (res.success) {
        setListing(res.data);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin bài đăng",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setLoading(false);
    };
    loadListing();
  }, [id, getListingById, toast]);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!listing) {
    return (
      <Container maxW="1140px" py={8}>
        <Center>
          <Text>Không tìm thấy bài đăng</Text>
        </Center>
      </Container>
    );
  }

  // 2. Lấy tọa độ từ dữ liệu Listing
  const coords = listing.location?.coords?.coordinates;

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Đăng nhập",
        description: "Vui lòng đăng nhập để liên hệ",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!listing?.owner?._id) {
      toast({
        title: "Lỗi",
        description: "Không thể tìm thấy thông tin người đăng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (listing.owner._id === user.id) {
      toast({
        title: "Thông báo",
        description: "Bạn không thể nhắn tin với chính mình",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setChatLoading(true);
    try {
      const res = await createOrFindConversation(listing.owner._id);
      if (res.success) {
        navigate(`/chat?conversation=${res.data._id}`);
      } else {
        toast({
          title: "Lỗi",
          description: res.message || "Không thể tạo cuộc trò chuyện",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo cuộc trò chuyện",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setChatLoading(false);
  };

  return (
    <Container maxW="1200px" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={8}>
        {/* Left Container */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="xl"
            shadow="lg"
            p={6}
          >
          {/* Dùng VStack để xếp ảnh và map theo chiều dọc, cách nhau 8 đơn vị */}
          <VStack spacing={8} align="stretch">
            {/* Phần Ảnh */}
            <ListingImageSection
              listing={listing}
              onContact={handleContact}
              chatLoading={chatLoading}
            />

            {/* --- 3. PHẦN BẢN ĐỒ (Thêm mới) --- */}
            <Box
              p={5}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              boxShadow="sm"
              bg="white"
            >
              <HStack justifyContent="space-between" mb={4} wrap="wrap" gap={2}>
                <Heading size="md">Vị trí bất động sản</Heading>

                {coords && coords.length === 2 && (
                  <Button
                    size="sm"
                    colorScheme={mapMode === "view" ? "blue" : "gray"}
                    variant={mapMode === "view" ? "solid" : "outline"}
                    leftIcon={
                      mapMode === "view" ? <FaDirections /> : <FaMapMarkerAlt />
                    }
                    onClick={() =>
                      setMapMode(mapMode === "view" ? "directions" : "view")
                    }
                  >
                    {mapMode === "view" ? "Chỉ đường tới đây" : "Xem vị trí"}
                  </Button>
                )}
              </HStack>

              <Text color="gray.600" mb={4}>
                {listing.location.detail}, {listing.location.ward},{" "}
                {listing.location.province}
              </Text>

              {coords && coords.length === 2 ? (
                <MapboxMap mode={mapMode} initialCoords={coords} height={mapMode === "directions" ? "600px" : "400px"} />
              ) : (
                <Box
                  h="200px"
                  bg="gray.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                >
                  <Text color="gray.500">
                    Chưa có thông tin vị trí trên bản đồ
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>
          </Box>
        </GridItem>

        {/* Right Container - Property Details + Actions */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="xl"
            shadow="lg"
            p={6}
            position="sticky"
            top="80px"
          >
          <ListingInfoSection
            listing={listing}
            user={user}
            onContact={handleContact}
          />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ListingDetailPage;
