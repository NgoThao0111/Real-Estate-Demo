import { Box, Flex, VStack, HStack, Avatar, Text, Heading, useColorModeValue, Icon, Divider, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPhone, FaEnvelope, FaUser } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { useUserStore } from "../store/user.js";

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useUserStore();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === user?._id;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadProfile();
  }, [userId, user]);

  const loadProfile = async () => {
    setLoading(true);
    
    if (isOwnProfile) {
      setProfileUser(user);
    } else {
      // Có thể gọi API để lấy thông tin user khác
      setProfileUser(user);
    }
    
    setLoading(false);
  };

  // Colors
  const infoBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");
  const labelColor = useColorModeValue("gray.500", "gray.500");

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}>
        <Text>Đang tải...</Text>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* PHẦN BÊN TRÁI - 1/4 màn hình - Hình tòa nhà */}
      <Box 
        w="25%" 
        position="relative"
        display={{ base: "none", lg: "block" }}
        data-aos="fade-right"
      >
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
          alt="Building"
          objectFit="cover"
          w="100%"
          h="100vh"
          position="sticky"
          top="0"
        />
      </Box>

      {/* PHẦN BÊN PHẢI - 3/4 màn hình - Thông tin Profile */}
      <Box 
        w={{ base: "100%", lg: "75%" }}
        p={{ base: 6, md: 12 }}
        data-aos="fade-left"
      >
        <VStack spacing={8} align="stretch" maxW="800px" mx="auto">
          {/* Card Profile */}
          <Box
            bg={infoBg}
            borderRadius="2xl"
            p={8}
            border="1px solid"
            borderColor={borderColor}
            shadow="xl"
          >
            <VStack spacing={6} align="center">
              {/* Avatar */}
              <Avatar
                size="2xl"
                src={profileUser?.profilePicture || profileUser?.avatar}
                name={profileUser?.name}
                border="4px solid"
                borderColor="blue.500"
                shadow="lg"
              />

              {/* Tên hiển thị */}
              <VStack spacing={1}>
                <Heading size="xl" color={headingColor} textAlign="center">
                  {profileUser?.name || "Người dùng"}
                </Heading>
                <Text color={textColor} fontSize="sm">
                  {profileUser?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </Text>
              </VStack>

              <Divider />

              {/* Thông tin chi tiết */}
              <VStack spacing={5} align="stretch" w="100%">
                {/* Họ và tên */}
                <HStack spacing={4}>
                  <Icon as={FaUser} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="xs" color={labelColor} fontWeight="600" textTransform="uppercase">
                      Họ và tên
                    </Text>
                    <Text fontSize="md" color={headingColor} fontWeight="600">
                      {profileUser?.name || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                </HStack>

                <Divider />

                {/* Số điện thoại */}
                <HStack spacing={4}>
                  <Icon as={FaPhone} color="green.500" boxSize={5} />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="xs" color={labelColor} fontWeight="600" textTransform="uppercase">
                      Số điện thoại
                    </Text>
                    <Text fontSize="md" color={headingColor} fontWeight="600">
                      {profileUser?.phone || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                </HStack>

                <Divider />

                {/* Email */}
                <HStack spacing={4}>
                  <Icon as={FaEnvelope} color="purple.500" boxSize={5} />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="xs" color={labelColor} fontWeight="600" textTransform="uppercase">
                      Email
                    </Text>
                    <Text fontSize="md" color={headingColor} fontWeight="600">
                      {profileUser?.email || "Chưa cập nhật"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ProfilePage;
