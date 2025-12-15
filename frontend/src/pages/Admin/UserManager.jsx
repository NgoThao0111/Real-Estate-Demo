import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Switch, HStack, Text } from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function UserManager() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminService.getUsers().then((res) => setUsers(res.data.users)).catch(() => {});
  }, []);

  const toggleBan = async (id, ban) => {
    try {
      await adminService.toggleBanUser(id, ban);
      setUsers((prev) => prev.map(u => u._id === id ? { ...u, isBanned: ban } : u));
    } catch (e) {}
  }

  return (
    <Box>
      <Heading size="md" mb={4}>User Management</Heading>

      <Box bg="white" borderRadius="md" p={4} overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
              <Th>Banned</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(u => (
              <Tr key={u._id}>
                <Td>{u.username}</Td>
                <Td>{u.name}</Td>
                <Td>{u.role}</Td>
                <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <HStack>
                    <Switch isChecked={u.isBanned} onChange={(e) => toggleBan(u._id, e.target.checked)} />
                    <Text fontSize="sm">{u.isBanned ? 'Banned' : 'Active'}</Text>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
