import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileContent from "../components/profile/ProfileContent";

import { useUserStore } from "../store/user.js";

import { useAuthContext } from "../context/AuthContext";

const UserProfilePage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useAuthContext();

  const [userProfile, setUserProfile] = useState(currentUser || null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Gọi hàm từ store (đã bỏ tham số id)
        const result = await useUserStore.getState().getUserInfor(); // Hoặc import hàm lẻ tùy cách bạn export

        if (result.success) {
          setUserProfile(result.data);
        } else {
          toast({ title: "Lỗi", description: result.message, status: "error" });
        }
      } catch (e) {
        // ...
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm này được truyền xuống ProfileContent để nhận dữ liệu mới khi user bấm Lưu
  const handleUpdateUser = async (updatedData) => {
    try {
      // Gọi hàm update từ store
      const result = await updateUserProfile(currentUser._id, updatedData);

      // Cập nhật lại UI bằng dữ liệu mới nhất server trả về
      setUserProfile(result);

      toast({
        title: "Cập nhật thành công",
        status: "success",
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // --- 3. XỬ LÝ ĐỔI PASSWORD (Optional: truyền xuống Content) ---
  const handleChangePassword = async (passwordData) => {
    try {
      await changeUserPassword(currentUser._id, passwordData);
      toast({ title: "Đổi mật khẩu thành công", status: "success" });
    } catch (error) {
      toast({
        title: "Lỗi đổi mật khẩu",
        description: error.message,
        status: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={{ base: 4, md: 8 }}>
      <Container maxW="container.lg">
        <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} spacing={8}>
          {/* CỘT TRÁI: SIDEBAR (Chiếm 1 phần) */}
          <Box gridColumn={{ lg: "span 1" }}>
            <ProfileSidebar userInfo={userProfile} />
          </Box>

          {/* CỘT PHẢI: CONTENT (Chiếm 2 phần) */}
          <Box gridColumn={{ lg: "span 2" }}>
            <ProfileContent
              userInfo={userProfile}
              onUpdateUser={handleUpdateUser}
            />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
