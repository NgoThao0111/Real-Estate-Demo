import React from "react";
import {
  Box,
  Avatar,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";

const ProfileSidebar = ({ userInfo }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      bg={cardBg}
      p={6}
      rounded="2xl"
      shadow="lg"
      border="1px solid"
      borderColor={borderColor}
      textAlign="center"
      h="fit-content"
    >
      <Box position="relative" display="inline-block" mb={4}>
        <Avatar
          size="2xl"
          name={userInfo.name}
          src="https://bit.ly/dan-abramov"
          border="4px solid white"
          shadow="md"
        />

        <IconButton
          aria-label="Upload Avatar"
          icon={<FiCamera />}
          size="sm"
          colorScheme="teal"
          rounded="full"
          position="absolute"
          bottom={0}
          right={0}
          shadow="md"
          onClick={() => alert("Logic upload ảnh sẽ đặt ở đây")}
        />
      </Box>

      <Heading fontSize="xl" fontWeight="bold" mb={1}>
        {userInfo.name}
      </Heading>
      <Text color="gray.500" fontSize="sm" mb={4}>
        {userInfo.email}
      </Text>

      <Divider my={4} />

      <VStack spacing={3} align="start" px={2}>
        <HStack justify="space-between" w="full">
          <Text fontWeight="600" fontSize="sm">
            Role:
          </Text>
          <Text fontSize="sm" color="gray.500">
            {userInfo.role}
          </Text>
        </HStack>
        <HStack justify="space-between" w="full">
          <Text fontWeight="600" fontSize="sm">
            Location:
          </Text>
          <Text fontSize="sm" color="gray.500">
            {userInfo.location}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProfileSidebar;
