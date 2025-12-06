import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const DrawerMenu = ({
  isOpen,
  onClose,
  openAuth,
  user,
  logoutUser,
  openCreate,
}) => {
  const linkColor = useColorModeValue("gray.700", "gray.100");

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={"3"}/>
        <DrawerHeader>
          <Text
            fontSize="28px"
            fontWeight="bold"
            textTransform="uppercase"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
          >
            Real Estate
          </Text>
        </DrawerHeader>
        <DrawerBody>
          <VStack align="start" spacing={4}>
            <Link to="/" onClick={onClose}>
              <Text color={linkColor}>Tìm kiếm</Text>
            </Link>
            <Link to="/contact" onClick={onClose}>
              <Text color={linkColor}>Cho thuê</Text>
            </Link>
            <Link to="/docs" onClick={onClose}>
              <Text color={linkColor}>Giao bán</Text>
            </Link>

            {!user ? (
              <>
                <Button
                  colorScheme="blue"
                  w="full"
                  onClick={() => openAuth("login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="outline"
                  w="full"
                  onClick={() => openAuth("register")}
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              <>
                <Button colorScheme="blue" w="full" onClick={openCreate}>
                  Đăng tin mới
                </Button>
                <Button w="full" onClick={logoutUser} variant={"outline"}>
                  Đăng xuất
                </Button>
              </>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerMenu;
