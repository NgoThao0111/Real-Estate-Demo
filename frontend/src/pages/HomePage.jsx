import { Container, SimpleGrid, Spinner, Center, Text, Heading, Box, Button } from "@chakra-ui/react";
import { FiUsers, FiGrid, FiCheckCircle } from "react-icons/fi";
import { useEffect } from "react";
import ListingCard from "../components/ListingCard";
import HomePanel from "../components/HomePanel";
import { useListStore } from "../store/list.js";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { listings, loading, error, fetchListings } = useListStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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
      <HomePanel />
      <Container maxW={"1140px"} mt={10} textAlign="left">
        <Heading as="h2" size="lg" mb={2}>
          Khám phá các bài đăng của chúng tôi
        </Heading>
        <Text color="gray.600">Tổng hợp các bài đăng nhà đất, căn hộ và đất nền được tuyển chọn — tìm ngay bất động sản phù hợp với bạn.</Text>
      </Container>

      <Container maxW={"1140px"} py={12}>
      {(!listings || listings.length === 0) ? (
        <Center>
          <Text>Chưa có bài đăng nào.</Text>
        </Center>
      ) : (
        (() => {
          const getTopThree = (items) => {
            if (!items || items.length === 0) return [];
            // Ưu tiên các trường xếp hạng rõ ràng nếu có
            const rankFields = ["score", "rating", "views"];
            for (const f of rankFields) {
              if (items.some((it) => it[f] !== undefined && it[f] !== null)) {
                return [...items].sort((a, b) => (b[f] || 0) - (a[f] || 0)).slice(0, 3);
              }
            }
            // Dự phòng lấy tin mới nhất
            if (items.some((it) => it.createdAt)) {
              return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
            }
            // Dự phòng cuối cùng: ba tin đầu tiên
            return items.slice(0, 3);
          };

          const top = getTopThree(listings);

          return (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                {top.map((l) => (
                  <ListingCard key={l._id || l.id} listing={l} />
                ))}
              </SimpleGrid>

              <Box mt={4} textAlign="right">
                <Button variant="outline" onClick={() => navigate('/listings')}>Xem tất cả</Button>
              </Box>
            </>
          );
        })()
      )}
      </Container>

      {/* Features section */}
      <Container maxW={"1140px"} mt={6} mb={12}>
        <Box textAlign="center" mb={6}>
          <Heading as="h3" size="lg">Tại sao chọn RealEstate Demo?</Heading>
          <Text color="gray.500" mt={2}>Đối tác tin cậy giúp bạn tìm bất động sản phù hợp.</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box bg="white" borderRadius="md" p={6} boxShadow="sm" textAlign="center">
            <Box mx="auto" mb={4} w="56px" h="56px" borderRadius="full" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
              <FiUsers size={24} color="#2B6CB0" />
            </Box>
            <Heading as="h4" size="md" mb={2}>Chuyên gia môi giới</Heading>
            <Text color="gray.600" fontSize="sm">Đội ngũ tư vấn chuyên nghiệp đồng hành cùng bạn trong mọi bước.</Text>
          </Box>

          <Box bg="white" borderRadius="md" p={6} boxShadow="sm" textAlign="center">
            <Box mx="auto" mb={4} w="56px" h="56px" borderRadius="full" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
              <FiGrid size={24} color="#2B6CB0" />
            </Box>
            <Heading as="h4" size="md" mb={2}>Nguồn lựa chọn đa dạng</Heading>
            <Text color="gray.600" fontSize="sm">Hàng nghìn tin đăng đã được kiểm duyệt, dễ dàng tìm được bất động sản phù hợp.</Text>
          </Box>

          <Box bg="white" borderRadius="md" p={6} boxShadow="sm" textAlign="center">
            <Box mx="auto" mb={4} w="56px" h="56px" borderRadius="full" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
              <FiCheckCircle size={24} color="#2B6CB0" />
            </Box>
            <Heading as="h4" size="md" mb={2}>Quy trình liền mạch</Heading>
            <Text color="gray.600" fontSize="sm">Ứng dụng công nghệ giúp trải nghiệm mua bán, thuê mướn trở nên suôn sẻ.</Text>
          </Box>
        </SimpleGrid>
      </Container>
      
      {/* CTA Register Banner */}
      <Container maxW={"1140px"} mt={12} mb={12}>
        <Box bg="blue.600" color="white" p={{ base: 6, md: 10 }} borderRadius="lg" textAlign="center">
          <Heading as="h3" size="lg" mb={2}>Cùng tham gia RealEstate Demo</Heading>
          <Text color="whiteAlpha.800" mb={4}>Tạo tài khoản để lưu tìm kiếm và nhận thông báo cá nhân hóa.</Text>
          <Button
            bg="yellow.400"
            color="black"
            _hover={{ bg: "yellow.300" }}
            onClick={() => navigate('/register')}
          >
            Đăng ký ngay
          </Button>
        </Box>
      </Container>
      <Container padding={4}></Container>
    </>
  );
};

export default HomePage;
