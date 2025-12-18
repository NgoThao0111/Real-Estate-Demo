import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  IconButton,
  Divider,
  useColorModeValue,
  Flex,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiCamera, FiUser, FiLock, FiHome } from "react-icons/fi";
import { useUserStore } from "../store/user.js";

const UserSettings = () => {
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const toast = useToast();

  // State lưu thông tin user
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref cho input upload ảnh
  const fileInputRef = useRef(null);

  // 1. Fetch dữ liệu user khi trang load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await useUserStore.getUserProfile();

        setCurrentUser(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast({
          title: "Lỗi tải dữ liệu",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      }
    };
    fetchUser();
  }, [toast]);

  //   // Logic upload avatar (Cơ bản)
  //   const handleAvatarChange = async (e) => {
  //     const file = e.target.files[0];
  //     if (!file) return;

  //     const formData = new FormData();
  //     formData.append("avatar", file);

  //     try {
  //       const token = localStorage.getItem("access_token");
  //       const res = await axios.post(`${API_URL}/user/upload-avatar`, formData, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });

  //       // Cập nhật lại UI ngay lập tức
  //       setCurrentUser({ ...currentUser, avatar: res.data.avatarUrl });
  //       toast({ title: "Cập nhật ảnh đại diện thành công", status: "success" });
  //     } catch (error) {
  //       toast({ title: "Lỗi upload ảnh", status: "error" });
  //     }
  //   };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box bg={bgPage} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading
          as="h1"
          size="xl"
          mb={2}
          textAlign={{ base: "center", md: "left" }}
        >
          Cài đặt tài khoản
        </Heading>

        <Flex
          direction={{ base: "column", md: "row" }}
          gap={8}
          align="start"
          mt={8}
        >
          {/* SIDEBAR USER INFO */}
          <Box
            w={{ base: "full", md: "300px" }}
            bg={bgCard}
            p={6}
            rounded="xl"
            shadow="sm"
            textAlign="center"
            border="1px solid"
            borderColor="gray.100"
          >
            <Box position="relative" display="inline-block" mb={4}>
              <Avatar
                size="2xl"
                name={currentUser?.name || "User"}
                src={currentUser?.avatar}
                mb={2}
                border="4px solid"
                borderColor="blue.500"
              />
              {/* Input file ẩn */}
              {/* <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                accept="image/*"
              /> */}
              {/* <IconButton
                aria-label="Upload image"
                icon={<FiCamera />}
                size="sm"
                rounded="full"
                colorScheme="blue"
                position="absolute"
                bottom="5px"
                right="5px"
                shadow="md"
                onClick={() => fileInputRef.current.click()} // Kích hoạt input file
              /> */}
            </Box>
            <Heading size="md">{currentUser?.name}</Heading>
            <Text color="gray.500" fontSize="sm">
              {currentUser?.email}
            </Text>
          </Box>

          {/* MAIN CONTENT */}
          <Box
            flex={1}
            w="full"
            bg={bgCard}
            rounded="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            <Tabs
              orientation="vertical"
              variant="line"
              colorScheme="blue"
              display={{ base: "none", md: "flex" }}
              minH="400px"
            >
              <TabList
                w="250px"
                bg="gray.50"
                py={4}
                borderRight="1px solid"
                borderColor="gray.100"
              >
                <Tab py={4} justifyContent="flex-start" pl={8}>
                  <HStack spacing={3}>
                    <FiUser />
                    <Text>Thông tin cá nhân</Text>
                  </HStack>
                </Tab>
                <Tab py={4} justifyContent="flex-start" pl={8}>
                  <HStack spacing={3}>
                    <FiLock />
                    <Text>Đổi mật khẩu</Text>
                  </HStack>
                </Tab>
                <Tab py={4} justifyContent="flex-start" pl={8}>
                  <HStack spacing={3}>
                    <FiHome />
                    <Text>Tin đăng của tôi</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels p={8}>
                <TabPanel>
                  {/* Truyền currentUser xuống component con */}
                  <ProfileSettings user={currentUser} />
                </TabPanel>
                <TabPanel>
                  <PasswordSettings />
                </TabPanel>
                <TabPanel>
                  <Text>
                    Danh sách tin đăng (Cần tích hợp API lấy danh sách bài post
                    của user)
                  </Text>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Mobile Tabs code... (giữ nguyên như cũ) */}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

// --- COMPONENT LOGIC: PROFILE SETTINGS ---
const ProfileSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    phone: user?.phone || "", // Giả sử user có trường phone
    address: user?.address || "", // Giả sử user có trường address
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("access_token");
      // Gọi API Update
    //   await axios.put(`${API_URL}/user/update/${user._id}`, formData, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });

      toast({
        title: "Cập nhật thành công",
        status: "success",
        duration: 3000,
      });
      setIsUpdating(false);
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description: error.response?.data?.message || "Lỗi server",
        status: "error",
      });
      setIsUpdating(false);
    }
  };

  return (
    <VStack spacing={6} align="start" maxW="800px">
      <Heading size="md">Thông tin hồ sơ</Heading>
      <Divider />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
        <FormControl>
          <FormLabel>Họ và tên</FormLabel>
          <Input
            id="username"
            value={formData.username}
            onChange={handleChange}
            focusBorderColor="blue.500"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Số điện thoại</FormLabel>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            focusBorderColor="blue.500"
            placeholder="Chưa cập nhật"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            value={user?.email}
            isReadOnly
            bg="gray.50"
            color="gray.500"
            cursor="not-allowed"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            Email dùng để đăng nhập, không thể thay đổi.
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>Địa chỉ</FormLabel>
          <Input
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            focusBorderColor="blue.500"
          />
        </FormControl>
      </SimpleGrid>

      <Button
        colorScheme="blue"
        mt={4}
        onClick={handleSubmit}
        isLoading={isUpdating}
        loadingText="Đang lưu..."
      >
        Lưu thay đổi
      </Button>
    </VStack>
  );
};

// --- COMPONENT LOGIC: PASSWORD SETTINGS ---
const PasswordSettings = () => {
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setPassData({ ...passData, [e.target.id]: e.target.value });
  };

  const handleChangePassword = async () => {
    // 1. Validate frontend cơ bản
    if (passData.newPassword !== passData.confirmPassword) {
      toast({ title: "Mật khẩu mới không khớp", status: "error" });
      return;
    }
    if (passData.newPassword.length < 6) {
      toast({ title: "Mật khẩu phải trên 6 ký tự", status: "warning" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
    //   await axios.put(
    //     `${API_URL}/user/change-password`,
    //     {
    //       currentPassword: passData.currentPassword,
    //       newPassword: passData.newPassword,
    //     },
    //     {
    //       headers: { Authorization: `Bearer ${token}` },
    //     }
    //   );

      toast({ title: "Đổi mật khẩu thành công", status: "success" });
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }); // Reset form
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Mật khẩu hiện tại không đúng",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="start" maxW="500px">
      <Heading size="md">Đổi mật khẩu</Heading>
      <Divider />

      <FormControl>
        <FormLabel>Mật khẩu hiện tại</FormLabel>
        <Input
          id="currentPassword"
          type="password"
          value={passData.currentPassword}
          onChange={handleChange}
          focusBorderColor="blue.500"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Mật khẩu mới</FormLabel>
        <Input
          id="newPassword"
          type="password"
          value={passData.newPassword}
          onChange={handleChange}
          focusBorderColor="blue.500"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
        <Input
          id="confirmPassword"
          type="password"
          value={passData.confirmPassword}
          onChange={handleChange}
          focusBorderColor="blue.500"
        />
      </FormControl>

      <Button
        colorScheme="blue"
        onClick={handleChangePassword}
        isLoading={loading}
      >
        Cập nhật mật khẩu
      </Button>
    </VStack>
  );
};

export default UserSettings;
