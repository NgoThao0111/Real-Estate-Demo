import React, { useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiUser, FiLock, FiSave } from "react-icons/fi";

const ProfileContent = ({ userInfo, onUpdateUser }) => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [localInfo, setLocalInfo] = useState({ ...userInfo });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setLocalInfo({ ...localInfo, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSaveInfo = () => {
    // Gọi hàm từ cha để cập nhật dữ liệu gốc (để Sidebar cũng đổi theo)
    onUpdateUser(localInfo);

    toast({
      title: "Đã lưu thông tin.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleSavePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Mật khẩu không khớp!", status: "error", duration: 3000 });
      return;
    }
    toast({
      title: "Đổi mật khẩu thành công!",
      status: "success",
      duration: 3000,
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <Box
      bg={cardBg}
      rounded="2xl"
      shadow="lg"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
    >
      <Tabs isFitted variant="enclosed-colored" colorScheme="teal">
        <TabList mb={4}>
          <Tab _selected={{ color: "white", bg: "teal.500" }}>
            <HStack>
              <FiUser />
              <Text>Thông tin chung</Text>
            </HStack>
          </Tab>
          <Tab _selected={{ color: "white", bg: "teal.500" }}>
            <HStack>
              <FiLock />
              <Text>Đổi mật khẩu</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels p={6}>
          {/* --- TAB INFO --- */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Thông tin cá nhân</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Họ và Tên</FormLabel>
                  <Input
                    name="name"
                    value={localInfo.name}
                    onChange={handleInfoChange}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={localInfo.email}
                    isReadOnly
                    bg="gray.100"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Số điện thoại</FormLabel>
                  <Input
                    name="phone"
                    value={localInfo.phone}
                    onChange={handleInfoChange}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  name="bio"
                  value={localInfo.bio}
                  onChange={handleInfoChange}
                  rows={3}
                />
              </FormControl>

              <Flex justify="flex-end">
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="teal"
                  onClick={handleSaveInfo}
                >
                  Lưu thay đổi
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* --- TAB PASSWORD --- */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Bảo mật</Heading>
              <FormControl>
                <FormLabel>Mật khẩu hiện tại</FormLabel>
                <Input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <Input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Xác nhận</FormLabel>
                  <Input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                  />
                </FormControl>
              </SimpleGrid>
              <Flex justify="flex-end">
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="teal"
                  onClick={handleSavePassword}
                >
                  Cập nhật mật khẩu
                </Button>
              </Flex>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ProfileContent;
