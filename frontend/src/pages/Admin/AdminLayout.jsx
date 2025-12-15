import { Box, Flex, VStack, HStack, Text, IconButton, Button, Avatar, Divider } from "@chakra-ui/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuthContext } from "../../context/AuthContext.jsx";

export default function AdminLayout() {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

  return (
    <Flex minH="100vh">
      <VStack w="250px" p={4} spacing={4} bg={"white"} borderRight="1px solid" borderColor="gray.100">
        <HStack w="full" justify="space-between">
          <Text fontWeight="bold">Admin</Text>
          <IconButton aria-label="menu" icon={<HamburgerIcon />} size="sm" />
        </HStack>

        <VStack spacing={2} align="stretch" w="full">
          <Button as={NavLink} to="/admin" variant="ghost" justifyContent="flex-start" colorScheme="blue">Dashboard</Button>
          <Button as={NavLink} to="/admin/properties" variant="ghost" justifyContent="flex-start">Property Management</Button>
          <Button as={NavLink} to="/admin/users" variant="ghost" justifyContent="flex-start">User Management</Button>
          <Button as={NavLink} to="/admin/messages" variant="ghost" justifyContent="flex-start">Message Center</Button>
        </VStack>

        <Divider />

        <HStack w="full" spacing={3} onClick={() => navigate("/profile") } cursor="pointer">
          <Avatar name={currentUser?.name} size="sm" />
          <Box>
            <Text fontSize="sm">{currentUser?.name}</Text>
            <Text fontSize="xs" color="gray.500">{currentUser?.role}</Text>
          </Box>
        </HStack>
      </VStack>

      <Box flex={1} p={6} bg={"gray.50"}>
        <Outlet />
      </Box>
    </Flex>
  );
}
