import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import CreateListingModal from "./CreateListingModal";
import { useUserStore } from "../store/user.js";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const linkColor = useColorModeValue('gray.700', 'gray.100');
  const [authMode, setAuthMode] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);

  const openAuth = (mode) => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }
  const closeAuth = () => {
    setAuthMode(null)
    setIsAuthOpen(false)
  }

  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

  const { user, logoutUser, checkSession } = useUserStore();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <Box bg={useColorModeValue("white", "gray.800")} boxShadow={"sm"}>
    <Container maxW="container.xl" px={4}>
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
              DemoPrj
            </Text>
          </Link>

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
          </HStack>
        </Flex>
        <HStack spacing={5} alignItems={"center"}>
          {!user ? (
            <>
              <Button bgColor={"transparent"} onClick={() => openAuth('login')}>
                Đăng nhập
              </Button>
              <Text color="muted">|</Text>
              <Button bgColor={"transparent"} onClick={() => openAuth('register')}>
                Đăng ký
              </Button>
            </>
          ) : (
            <UserMenu user={user} logoutUser={logoutUser} />
          )}
          <Button colorScheme="blue" onClick={() => {
            if (!user) {
              openAuth('login');
              return;
            }
            openCreate();
          }}>
            Đăng tin mới
          </Button>
        </HStack>
      </Flex>
    </Container>
    <AuthModal isOpen={isAuthOpen} onClose={closeAuth} defaultMode={authMode}/>
    <CreateListingModal isOpen={isCreateOpen} onClose={closeCreate} />
    </Box>
  );
};

export default Navbar;
