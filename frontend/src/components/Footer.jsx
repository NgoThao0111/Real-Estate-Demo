import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const bg = useColorModeValue("#0d2a47", "#0f1e33");
  const textColor = useColorModeValue("gray.200", "gray.300");
  const headingColor = useColorModeValue("white", "white");

  return (
    <Box bg={bg} color={textColor} py={10}>
      <Container maxW="1140px">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap={10}
        >
          {/* Logo + Social */}
          <VStack align="start" spacing={4}>
            <Link to="/">
              <Text
                fontSize="28px"
                fontWeight="bold"
                bgGradient="linear(to-r, cyan.400, blue.500)"
                bgClip="text"
              >
                Real Estate
              </Text>
            </Link>
            
            <VStack align="start" spacing={3}>
              <Text>
                <strong>Điện thoại:</strong> +(690) 2560 0020
              </Text>
              <Text>
                <strong>Email:</strong> real@property.com
              </Text>
            </VStack>
          </VStack>

          {/* Address */}
          <VStack align="start" spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              Địa chỉ
            </Text>
            <Text>Công ty Bất động sản Real Estate</Text>
            <Text>Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội</Text>
          </VStack>

          {/* Quick links */}
          <VStack align="start" spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              Liên kết nhanh
            </Text>
            <Link to="/"><Text>Giao bán</Text></Link>
            <Link to="/"><Text>Cho thuê</Text></Link>
          </VStack>

          {/* Popular searches */}
          <VStack align="start" spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              Tìm kiếm phổ biến
            </Text>
            <Link to="/"><Text>Chung cư</Text></Link>
            <Link to="/"><Text>Nhà đất</Text></Link>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
