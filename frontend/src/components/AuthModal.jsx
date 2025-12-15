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
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/user.js";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }) => {
  const [mode, setMode] = useState(defaultMode);

  // State form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    role: "guest", // Mặc định role guest nếu backend yêu cầu
    type: "login",
  });

  const toast = useToast();

  // Lấy các hàm từ Store (Lưu ý: Không lấy checkSession nữa)
  const { registerUser, loginUser, loading, requestLoginGoogle } =
    useUserStore();
  const { updateUser } = useAuthContext();
  const navigate = useNavigate();

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode || "login");
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
        phone: "",
        role: "guest",
        type: "login",
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
      const { success, message, user } = await loginUser(formData);

      if (!success) {
        toast({
          title: "Đăng nhập thất bại",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Chào mừng trở lại!",
          description: message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Update AuthContext so role-based UI updates immediately
        if (user) updateUser(user);

        // If admin, redirect to admin dashboard for convenience
        if (user?.role === "admin") {
          navigate("/admin");
        }

        onClose();
      }
    } else {
      // REGISTER
      // 1. VALIDATION PHÍA CLIENT (Chỉ cho phần Đăng ký)
      if (formData.password !== formData.confirmPassword) {
        return toast({
          title: "Mật khẩu không khớp",
          description: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      if (formData.password.length < 6) {
        return toast({
          title: "Mật khẩu quá ngắn",
          description: "Mật khẩu nên có ít nhất 6 ký tự.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      if (!formData.email.includes("@")) {
        return toast({
          title: "Email không hợp lệ",
          description: "Vui lòng nhập đúng định dạng email.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }

      const { success, message, user } = await registerUser(formData);

      if (!success) {
        toast({
          title: "Đăng ký thất bại",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Tài khoản đã được tạo và tự động đăng nhập!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        if (user) updateUser(user);
        onClose();
      }
    }
  };

  const handleSuccess = async (response) => {
    const { credential } = response; //Nhan ID token tu google
    console.log(credential);
    try {
      const { success, message, user } = await requestLoginGoogle(credential);
      if (!success) {
        toast({
          title: "Đăng nhập thất bại",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Chào mừng trở lại!",
          description: message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        if (user) updateUser(user);
        if (user?.role === "admin") navigate("/admin");
        onClose();
      }
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader textAlign="center">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản mới"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={4}>
            {/* Username */}
            <FormControl isRequired>
              <FormLabel>Tên đăng nhập</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
              />
            </FormControl>
            {/* Password */}
            <FormControl isRequired>
              <FormLabel>Mật khẩu</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
            </FormControl>

            {/* Register Fields */}
            {mode === "register" && (
              <>
                <FormControl isRequired>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Họ và tên</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Số điện thoại</FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912..."
                  />
                </FormControl>
              </>
            )}

            {/* 3. Divider ngăn cách */}
            <HStack w="full" py={2}>
              <Divider />
              <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
                Hoặc tiếp tục với
              </Text>
              <Divider />
            </HStack>

            {/* 4. Google Login Button */}
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            >
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </GoogleOAuthProvider>

            {/* Switch Mode Link */}
            <HStack justify="center" pt={2} w="full">
              <Text fontSize="sm" color="gray.500">
                {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              </Text>
              <Button
                variant="link"
                colorScheme="blue"
                size="sm"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderBottomRadius="md">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading} // Hiển thị loading spinner khi đang gọi API
            loadingText={
              mode === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."
            }
          >
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
