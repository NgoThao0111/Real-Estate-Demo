import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Button } from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function AdminActions(){
  const [actions, setActions] = useState([]);
  const [page, setPage] = useState(1);
  const cardBg = useColorModeValue('white','gray.800');

  const fetch = async (p = 1) => {
    try {
      const res = await adminService.getAdminActions(p, 50);
      setActions(res.data.actions || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { fetch(); }, []);

  return (
    <Box>
      <Heading size="md" mb={4}> Lịch sử hoạt động</Heading>
      <Box bg={cardBg} borderRadius="md" p={4} overflowX="auto">
        <Table>
          <Thead>
            <Tr><Th>Thời gian</Th><Th>Quản trị viên</Th><Th>Hành động</Th><Th>Mục tiêu</Th><Th>Chi tiết</Th></Tr>
          </Thead>
          <Tbody>
            {actions.map(a => (
              <Tr key={a._id}>
                <Td>{new Date(a.createdAt).toLocaleString()}</Td>
                <Td>{a.admin?.name || a.admin?.username || a.admin}</Td>
                <Td>{a.action}</Td>
                <Td>{a.target ? (typeof a.target === 'string' ? a.target : JSON.stringify(a.target)) : '-'}</Td>
                <Td><Text whiteSpace="pre-wrap">{a.meta ? JSON.stringify(a.meta) : ''}</Text></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Button mt={3} onClick={() => { setPage(p => p+1); fetch(page+1); }}>Tải thêm</Button>
      </Box>
    </Box>
  );
}
