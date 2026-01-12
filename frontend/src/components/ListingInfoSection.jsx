import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Divider,
  SimpleGrid,
  Icon,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiHeart,
  FiShare2,
  FiHome,
  FiMaximize,
} from "react-icons/fi";
import { IoWarningOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/user.js";
import { useListStore } from "../store/list.js";
import ReportModal from "./ReportModal.jsx";
import { useChatStore } from "../store/chat.js";
import { useNavigate } from "react-router-dom";

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  if (user.name) return user.name;
};

const ListingInfoSection = ({ user, listing, onContact }) => {
  const toggleSave = useUserStore((s) => s.toggleSaveListing);
  const savedListings = useUserStore((s) => s.savedListings);
  const fallbackToggle = useListStore((s) => s.toggleSaveListing);
  const toast = useToast();
  const navigate = useNavigate();
  const [isContacting, setIsContacting] = useState(false);

  const { createOrFindConversation } = useChatStore();

  const contentBg = useColorModeValue("white", "gray.800");
  const subTextColor = useColorModeValue("gray.600", "white");

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleContact = async () => {
    if (!listing.owner?._id) {
      return toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người bán.",
        status: "error",
        duration: 3000,
      });
    }

    setIsContacting(true);
    console.log(listing.owner?._id);
    try {

      const listingUrl = `${window.location.origin}/listings/${listing._id}`;

      const autoMessage = `Tôi muốn tham khảo bài viết: [${listing.title}](${listingUrl})`;

      const result = await createOrFindConversation(listing.owner?._id, autoMessage);

      if (result.success) {
        useChatStore.getState().setSelectedConversation(result.conversation);
        
        navigate(`/chat?id=${result.conversation._id}`);
      } else {
        toast({
          title: "Thông báo",
          description: result.message,
          status: "info",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi kết nối tin nhắn. Có vẻ bạn chưa đăng nhập",
        status: "error",
      });
    } finally {
      setIsContacting(false);
    }
  };

  useEffect(() => {
    setIsSaved(savedListings.includes(listing._id));
  }, [savedListings, listing._id]);

  return (
    <Box
      bg={contentBg}
      p={6}
      position="sticky"
      top="20px"
      borderRadius="lg"
      borderWidth="2px"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {/* Title and Location */}
        <Box>
          <Heading size="lg" mb={2} lineHeight="short">
            {listing.title}
          </Heading>
          <HStack color={subTextColor} fontSize="sm">
            <Icon as={FiMapPin} />
            <Text>
              {listing.location?.detail}, {listing.location?.ward},{" "}
              {listing.location?.province}
            </Text>
          </HStack>
        </Box>

        {/* Price */}
        <Box>
          <Text fontSize="sm" color={subTextColor}>
            {listing.rental_type === "rent" ? "Giá thuê" : "Giá bán"}
          </Text>
          <Text color="blue.500" fontSize="2xl" fontWeight="700">
            {listing.price
              ? `${Number(listing.price).toLocaleString("vi-VN")} ${
                  listing.rental_type === "rent" ? "VNĐ/tháng" : "VNĐ"
                }`
              : "—"}
          </Text>
        </Box>

        <Divider />

        {/* Property Details */}
        <VStack spacing={3} align="stretch">
          <Text fontWeight="600">Thông tin chi tiết</Text>

          <SimpleGrid columns={2} spacing={3}>
            <HStack>
              <Icon as={FiHome} color={subTextColor} />
              <Text fontSize="sm">
                <Text as="span" color={subTextColor}>
                  Loại:
                </Text>{" "}
                <Badge colorScheme="blue" ml={1}>
                  {listing.property_type?.name || listing.property_type}
                </Badge>
              </Text>
            </HStack>

            <HStack>
              <Icon as={FiMaximize} color={subTextColor} />
              <Text fontSize="sm">
                <Text as="span" color={subTextColor}>
                  Diện tích:
                </Text>{" "}
                {listing.area} m²
              </Text>
            </HStack>
          </SimpleGrid>

          <Box>
            <Text fontSize="sm" color={subTextColor} mb={1}>
              Trạng thái:
            </Text>
            {(() => {
              const getStatusInfo = (status) => {
                switch (status) {
                  case "approved":
                    return { text: "Còn trống", color: "green" };
                  case "pending":
                    return { text: "Chờ duyệt", color: "yellow" };
                  case "rejected":
                    return { text: "Không được duyệt", color: "red" };
                  case "closed":
                    return { text: "Đã đóng", color: "gray" };
                  default:
                    return { text: status, color: "gray" };
                }
              };
              const { text, color } = getStatusInfo(listing.status);
              return (
                <Badge colorScheme={color} size="sm">
                  {text}
                </Badge>
              );
            })()}
          </Box>

          {listing.description && (
            <Box>
              <Text fontSize="sm" color={subTextColor} mb={1}>
                Mô tả:
              </Text>
              <Text fontSize="sm" lineHeight="tall">
                {listing.description}
              </Text>
            </Box>
          )}
        </VStack>

        <Divider />

        {/* Action Buttons */}
        <VStack spacing={3}>
          <Button
            colorScheme="red"
            size="lg"
            width="full"
            onClick={handleContact}
            isLoading={isContacting}
            isDisabled={listing.status !== "approved"}
          >
            {listing.rental_type === "rent" ? "Thuê ngay" : "Mua ngay"}
          </Button>

          <HStack width="full">
            <Button
              leftIcon={isSaved ? <FaHeart /> : <FiHeart />}
              variant={isSaved ? "solid" : "outline"}
              colorScheme={isSaved ? "blue" : "gray"}
              flex={1}
              isLoading={isLoading}
              _active={{
                transform: "translateY(0px)",
              }}
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                try {
                  const res = toggleSave
                    ? await toggleSave(listing._id)
                    : await fallbackToggle(listing._id);
                  if (res.success) {
                    toast({
                      title: res.message,
                      status: "success",
                      isClosable: true,
                      duration: 2000,
                    });
                  } else {
                    toast({
                      title: res.message || "Lỗi",
                      status: "error",
                      isClosable: true,
                    });
                  }
                } catch (err) {
                  toast({
                    title: err.message || "Lỗi khi lưu",
                    status: "error",
                    isClosable: true,
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isSaved ? "Đã lưu" : "Lưu"}
            </Button>
            <Button
              leftIcon={<FiShare2 />}
              variant="outline"
              flex={1}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Đã sao chép",
                  description: "Đã sao chép liên kết vào clipboard",
                  status: "success",
                  duration: 2000,
                });
              }}
            >
              Chia sẻ
            </Button>
            <Button
              leftIcon={<IoWarningOutline />}
              variant="outline"
              flex={1}
              onClick={() => {
                setIsReportOpen(true);
              }}
            >
              Báo xấu
            </Button>
          </HStack>
        </VStack>

        {/* Safety Notice */}
        <Box
          bg="yellow.50"
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor="yellow.200"
        >
          <Text fontSize="xs" color="yellow.800">
            💡 <strong>Lưu ý an toàn:</strong> Hãy kiểm tra kỹ thông tin và gặp
            trực tiếp để xem nhà trước khi quyết định thuê/mua.
          </Text>
        </Box>

        {/* Report modal */}
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          listingId={listing._id}
        />
      </VStack>
    </Box>
  );
};

export default ListingInfoSection;
