import { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Switch,
  HStack,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useColorModeValue
} from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pending, setPending] = useState({ id: null, ban: false });
  const cancelRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getUsers();
        setUsers(res.data.users || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const cardBg = useColorModeValue('white','gray.800');
  const textColor = useColorModeValue('gray.800','white');

  const confirmToggle = (id, ban) => {
    setPending({ id, ban });
    onOpen();
  };

  const toggleBan = async () => {
    try {
      const { id, ban } = pending;
      await adminService.toggleBanUser(id, ban);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBanned: ban } : u)));
      toast({ status: "success", title: "Cập nhật thành công" });
    } catch (e) {
      toast({ status: "error", title: "Thao tác thất bại" });
    } finally {
      onClose();
      setPending({ id: null, ban: false });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Quản lý người dùng
      </Heading>

      <Box bg={cardBg} borderRadius="md" p={4} overflowX="auto">
        <Table variant="simple" color={textColor}>
          <Thead>
            <Tr>
              <Th>Tên đăng nhập</Th>
              <Th>Email</Th>
                <Th>Phone</Th>
              <Th>Tên</Th>
              <Th>Vai trò</Th>
              <Th>Ngày tham gia</Th>
              <Th>Bị cấm</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u._id}>
                <Td>{u.username}</Td>
                <Td>{u.email || '-'}</Td>
                <Td>{u.phone || '-'}</Td>
                <Td>{u.name}</Td>
                <Td>{u.role === 'guest' ? 'User' : (u.role || '')}</Td>
                <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <HStack>
                    <Switch colorScheme="red" isChecked={u.isBanned} onChange={(e) => confirmToggle(u._id, e.target.checked)} />
                    <Text fontSize="sm" color={u.isBanned ? 'red.500' : undefined}>{u.isBanned ? "Bị cấm" : "Hoạt động"}</Text>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Xác nhận hành động
              </AlertDialogHeader>

              <AlertDialogBody>{pending.ban ? 'Bạn có chắc muốn cấm người dùng này?' : 'Bạn có chắc muốn bỏ cấm người dùng này?'}</AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Hủy
                </Button>
                <Button colorScheme="red" onClick={toggleBan} ml={3}>
                  {pending.ban ? "Cấm" : "Bỏ cấm"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
}
