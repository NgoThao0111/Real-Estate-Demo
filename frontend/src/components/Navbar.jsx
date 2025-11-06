import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaRegPlusSquare } from "react-icons/fa";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import React, { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import CreateListing from "./CreateListing";
import { useUserStore } from "../store/user";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const linkColor = useColorModeValue('gray.700', 'gray.100');
  const [authMode, setAuthMode] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);

  const user = useUserStore((s) => s.user);

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

  useEffect(() => {
    if (user && pendingCreate) {
      setPendingCreate(false);
      setIsAuthOpen(false);
      openCreate();
    }
  }, [user, pendingCreate]);

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
          <Button colorScheme="blue" onClick={() => {
            if (user) openCreate();
            else {
              setPendingCreate(true);
              openAuth('login');
            }
          }}>
            Tạo bài viết mới
          </Button>
        </HStack>
      </Flex>
    </Container>
    <AuthModal isOpen={isAuthOpen} onClose={closeAuth} defaultMode={authMode}/>

    <Modal isOpen={isCreateOpen} onClose={closeCreate} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tạo bài đăng mới</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CreateListing onSuccess={() => { closeCreate(); }} />
        </ModalBody>
      </ModalContent>
    </Modal>
    </Box>
  );
};

export default Navbar;
