import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Select,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Stack,
  Center,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useListStore } from "../store/list.js";
import { useNavigate } from "react-router-dom";

const HomePanel = () => {
  const { listings, loading, error, fetchListings } = useListStore();
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const navigate = useNavigate();
  const contentBg = useColorModeValue("white", "gray.800");
  const subText = useColorModeValue("gray.200", "white");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  useEffect(() => {
    // Allow skipping automatic API calls in development to avoid Vite proxy errors
    // Set `VITE_SKIP_API=true` in `frontend/.env` to disable automatic fetching
    if (import.meta.env.VITE_SKIP_API === 'true') return;
    fetchListings();
  }, [fetchListings]);

  const onSearch = () => {
    // simple navigation to results (implement actual query handling later)
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (type) params.set("type", type);
    navigate(`/?${params.toString()}`);
  };

  return (
    <Box>
      {/* HERO */}
      <Box
        h={{ base: "340px", md: "420px" }}
        bgImage={"url('https://th.bing.com/th/id/R.882fba727d519950a5f7184aef7e582b?rik=e%2faiVMLLFj2BhA&pid=ImgRaw&r=0')"}
        bgSize="cover"
        bgPos="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box position="absolute" inset={0} bgGradient="linear(to-b, rgba(2,6,23,0.6), rgba(2,6,23,0.2))" />

        <Container maxW="1140px" zIndex={2} textAlign="center">
          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} mb={3}>
            Tìm ngôi nhà mơ ước của bạn
          </Heading>
          <Text color={subText} mb={6} fontSize={{ base: "sm", md: "md" }}>
            Cách dễ nhất để mua, bán và cho thuê bất động sản.
          </Text>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={4}
          >
            <Box
              w={{ base: "100%", md: "84%" }}
              bg={contentBg}
              p={3}
              borderRadius="32px"
              boxShadow={cardShadow}
            >
              <Stack direction={{ base: "column", md: "row" }} spacing={3} align="center">
                <InputGroup flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Nhập từ khóa, địa chỉ, thành phố..."
                    borderRadius="full"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    borderWidth={0}
                    _placeholder={{ color: "gray.400" }}
                  />
                </InputGroup>

                <Select
                  w={{ base: "100%", md: "240px" }}
                  placeholder="Chọn loại bất động sản"
                  borderRadius="full"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="house">Nhà đất</option>
                  <option value="apartment">Chung cư</option>
                </Select>

                <Button colorScheme="blue" px={8} borderRadius="full" onClick={onSearch}>
                  Tìm kiếm
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* STATS */}
      <Container maxW="1140px" mt={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box bg={contentBg}  borderRadius="md" p={6} boxShadow={cardShadow}>
            <Stat>
              <StatLabel>Số lượng bất động sản</StatLabel>
              <StatNumber fontSize="2xl">1,000,000+</StatNumber>
            </Stat>
          </Box>

          <Box bg={contentBg}  borderRadius="md" p={6} boxShadow={cardShadow}>
            <Stat>
              <StatLabel>Khách hàng hài lòng</StatLabel>
              <StatNumber fontSize="2xl">10,000+</StatNumber>
            </Stat>
          </Box>

          <Box bg={contentBg}  borderRadius="md" p={6} boxShadow={cardShadow}>
            <Stat>
              <StatLabel>Thâm niên trong ngành</StatLabel>
              <StatNumber fontSize="2xl">50+</StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default HomePanel;