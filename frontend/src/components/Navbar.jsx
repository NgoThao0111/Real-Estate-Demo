import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaRegPlusSquare } from "react-icons/fa";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { useState } from "react";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const linkColor = useColorModeValue('gray.700', 'gray.100');
  const [authMode, setAuthMode] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = (mode) => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }
  const closeAuth = () => {
    setAuthMode(null)
    setIsAuthOpen(false)
  }

  return (
    <Box>
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row",
        }}
      >
        <Flex alignItems="center" gap={6}>
          <Link to="/">
            <Text
              fontSize={{ base: "22px", sm: "28px" }}
              fontWeight={"bold"}
              textTransform={"uppercase"}
              bgGradient={"linear(to-r, cyan.400, blue.500)"}
              bgClip={"text"}
            >
              Rencity
            </Text>
          </Link>

          {/* Hide center links on very small screens if desired */}
          <HStack spacing={8} display={{ base: "none", sm: "flex" }} fontSize={{ base: "10", sm: "16" }}>
            <Link to="/">
              <Text 
                color={linkColor} 
                fontWeight={"medium"}
                _hover={{
                  color:"blue.500"
                }}
              >
                Trang chủ
              </Text>
            </Link>
            <Link to="/">
              <Text 
                color={linkColor} 
                fontWeight={"medium"}
                _hover={{
                  color:"blue.500"
                }}
              >
                Bài đăng của tôi
              </Text>
            </Link>
            <Link to="/">
              <Text 
                color={linkColor} 
                fontWeight={"medium"}
                _hover={{
                  color:"blue.500"
                }}
              >
                Bài đăng đã lưu
              </Text>
            </Link>
          </HStack>
        </Flex>
        <HStack spacing={2} alignItems={"center"}>
          <Button bgColor={"transparent"} onClick={() => openAuth('login')}>
            Đăng nhập
          </Button>
          <Text color="muted">|</Text>
          <Button bgColor={"transparent"} onClick={() => openAuth('register')}>
            Đăng ký
          </Button>
          <Button variant="ghost" onClick={toggleColorMode}>
            {colorMode === "light" ? (
              <MdOutlineDarkMode size={20} />
            ) : (
              <MdOutlineLightMode size={20} />
            )}
          </Button>
          <Link to="/">
            <Button colorScheme="blue">
              Tạo bài viết mới
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Container>
    <AuthModal isOpen={isAuthOpen} onClose={closeAuth} defaultMode={authMode}/>
    </Box>
  );
};

export default Navbar;
