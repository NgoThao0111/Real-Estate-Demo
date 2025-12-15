import { Box, Flex, VStack, HStack, Text, IconButton, Button, Avatar, Divider, useColorModeValue } from "@chakra-ui/react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuthContext } from "../../context/AuthContext.jsx";

export default function AdminLayout() {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const sidebarBorder = useColorModeValue('gray.100', 'gray.700');
  const mainBg = useColorModeValue('gray.50', 'gray.900');

  const normalizePath = (p) => (p || '').replace(/\/+$/, '') || '/';
  const isActive = (path) => normalizePath(path) === normalizePath(location.pathname);

  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('gray.100', 'gray.700');

  const itemProps = (path) => ({
    variant: 'ghost',
    justifyContent: 'flex-start',
    _hover: { bg: hoverBg, color: 'blue.600' },
    bg: isActive(path) ? activeBgColor : undefined,
    color: isActive(path) ? 'blue.600' : undefined,
    fontWeight: isActive(path) ? 600 : undefined,
  });

  return (
    <Flex minH="100vh">
      <VStack w="250px" p={4} spacing={4} bg={sidebarBg} borderRight="1px solid" borderColor={sidebarBorder}>
        <HStack w="full" justify="space-between">
          <Text fontWeight="bold">Quản trị</Text>
          <IconButton aria-label="menu" icon={<HamburgerIcon />} size="sm" />
        </HStack>

        <VStack spacing={2} align="stretch" w="full">
          <Button as={NavLink} to="/admin" {...itemProps('/admin')}>Tổng quan</Button>
          <Button as={NavLink} to="/admin/properties" {...itemProps('/admin/properties')}>Quản lý tin đăng</Button>
          <Button as={NavLink} to="/admin/users" {...itemProps('/admin/users')}>Quản lý người dùng</Button>
          <Button as={NavLink} to="/admin/messages" {...itemProps('/admin/messages')}>Trung tâm thông báo</Button>
          <Button as={NavLink} to="/admin/reports" {...itemProps('/admin/reports')}>Báo cáo</Button>
          <Button as={NavLink} to="/admin/actions" {...itemProps('/admin/actions')}>Lịch sử hoạt động</Button>
        </VStack>

        <Divider />

        <HStack w="full" spacing={3} onClick={() => navigate("/profile") } cursor="pointer">
          <Avatar name={currentUser?.name} size="sm" />
          <Box>
            <Text fontSize="sm" color={useColorModeValue('gray.800','white')}>{currentUser?.name}</Text>
            <Text fontSize="xs" color={useColorModeValue('gray.500','gray.300')}>{currentUser?.role}</Text>
          </Box>
        </HStack>
      </VStack>

      <Box flex={1} p={6} bg={mainBg}>
        <Outlet />
      </Box>
    </Flex>
  );
}
