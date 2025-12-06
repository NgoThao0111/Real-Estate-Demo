import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  IconButton,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  IconButton,
  Box
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { HamburgerIcon} from "@chakra-ui/icons";
import DrawerMenu from "./DrawerMenu";
import AuthModal from "./AuthModal";
import CreateListingModal from "./CreateListingModal";
import { useUserStore } from "../store/user.js";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const linkColor = useColorModeValue("gray.700", "gray.100");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [authMode, setAuthMode] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const { user, logoutUser, checkSession } = useUserStore();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <Box bg={useColorModeValue("white", "gray.800")} boxShadow="sm">
      <Container maxW="1140px" px={4}>
        <Flex h={16} align="center" justify="space-between">
          {/* Left: Logo */}
          <Link to="/">
            <Text
              fontSize="28px"
              fontWeight="bold"
              textTransform="uppercase"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              bgClip="text"
            >
              Real Estate
            </Text>
          </Link>

          {/* Middle: Nav Links (hidden on mobile) */}
          <HStack spacing={8} display={{ base: "none", lg: "flex" }}>
            <Link to="/">
              <Text color={linkColor} _hover={{ color: "blue.500" }}>
                Tìm kiếm
              </Text>
            </Link>
            <Link to="/">
              <Text color={linkColor} _hover={{ color: "blue.500" }}>
                Cho thuê
              </Text>
            </Link>
            <Link to="/">
              <Text color={linkColor} _hover={{ color: "blue.500" }}>
                Giao bán
              </Text>
            </Link>
          </HStack>

          {/* Right: Buttons */}
          {!user ? (
            <HStack display={{ base: "none", lg: "flex" }}>
              <Button colorScheme="blue" onClick={() => openAuth("login")}>
                Đăng nhập
              </Button>
              <Button variant={"outline"} onClick={() => openAuth("register")}>
                Đăng ký
              </Button>
            </HStack>
          ) : (
            <HStack spacing={"4"}>
              <UserMenu user={user} logoutUser={logoutUser} />
              <Button
                colorScheme="blue"
                display={{base: "none", lg: "flex"}}
                onClick={() => {
                  setIsCreateOpen(true);
                }}
              >
                Đăng tin mới
              </Button>
              {/* Mobile Menu Button */}
              <IconButton
                display={{ base: "flex", lg: "none" }}
                icon={<HamburgerIcon />}
                onClick={onOpen}
                variant={"ghost"}
                aria-label="Open Menu"
              />
            </HStack>
          )}
        </Flex>
      </Container>

      <DrawerMenu
        isOpen={isOpen}
        onClose={onClose}
        openAuth={openAuth}
        user={user}
        logoutUser={logoutUser}
        openCreate={() => setIsCreateOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </Box>
  );
};

export default Navbar;
