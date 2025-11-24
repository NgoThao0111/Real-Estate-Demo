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
import ListingImageSection from "../components/ListingImageSection.jsx";
import ListingInfoSection from "../components/ListingInfoSection.jsx";

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getListingById } = useListStore();
  const { user } = useUserStore();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleContact = () => {
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
    navigate('/chat');
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