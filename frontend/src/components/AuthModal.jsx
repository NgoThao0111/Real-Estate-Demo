import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useUserStore } from "../store/user.js";

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }) => {
  const [mode, setMode] = useState(defaultMode);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "",
  });
  const toast = useToast();
  const { registerUser, loginUser, checkSession, logoutUser, loading, error } =
    useUserStore();

  useEffect(() => {
    checkSession();

    if (isOpen) {
      setMode(defaultMode || "login");
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
        role: "guest",
      });
    }
  }, [isOpen, defaultMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "login") {
      const { success, message } = await loginUser(formData);
      if (!success) {
        toast({
          title: "Lỗi",
          description: message,
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: "Thành công",
          description: message,
          status: "success",
          isClosable: true,
        });
        window.location.reload();
        onClose();
      }
      return;
    } else {
      const { success, message } = await registerUser(formData);
      if (!success) {
        toast({
          title: "Lỗi",
          description: message,
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: "Thành công",
          description: message,
          status: "success",
          isClosable: true,
        });
        window.location.reload();
        onClose();
      }
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Tên đăng nhập</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Mật khẩu</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>
            {mode === "register" && (
              <>
                <FormControl isRequired>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Họ và tên</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Số điện thoại</FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </FormControl>
              </>
            )}
            <HStack justify="center" pt={2} alignItems="center" spacing={2}>
              <Text fontSize="sm" lineHeight="1">
                {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              </Text>
              <Button
                variant="link"
                color="blue.500"
                padding={0}
                height="auto"
                minH={0}
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" colorScheme="blue" mr={3}>
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </Button>
          <Button variant={"ghost"} onClick={onClose}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
