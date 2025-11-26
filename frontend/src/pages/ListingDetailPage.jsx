import {
  Container,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Center,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListStore } from "../store/list.js";
import { useUserStore } from "../store/user.js";
import { useChatStore } from "../store/chat.js";
import ListingImageSection from "../components/ListingImageSection.jsx";
import ListingInfoSection from "../components/ListingInfoSection.jsx";

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

    // Kiểm tra nếu người dùng đang cố gắng nhắn tin với chính mình
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
        // Điều hướng đến trang chat với conversation ID
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

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Đăng nhập", 
        description: "Vui lòng đăng nhập để lưu bài đăng",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: "Đã lưu",
      description: "Bài đăng đã được lưu vào danh sách yêu thích",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="1200px" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={8}>
        {/* Left Container - Images + Seller Info */}
        <GridItem>
          <ListingImageSection 
            listing={listing}
            onContact={handleContact}
            chatLoading={chatLoading}
          />
        </GridItem>

        {/* Right Container - Property Details + Actions */}
        <GridItem>
          <ListingInfoSection
            listing={listing}
            user={user}
            onContact={handleContact}
            onSave={handleSave}
          />
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ListingDetailPage;