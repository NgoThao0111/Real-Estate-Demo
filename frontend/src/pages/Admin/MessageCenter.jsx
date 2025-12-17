import { useState, useEffect } from "react";
import { Box, Heading, Textarea, Input, Button, VStack, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue } from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function MessageCenter(){
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("");
  const [notifications, setNotifications] = useState([]);
  const toast = useToast();

  const cardBg = useColorModeValue('white','gray.800');
  const textColor = useColorModeValue('gray.800','white');

  const send = async () => {
    try {
      let audience = 'all';
      if (target && target.trim()) {
        audience = target.includes('@') ? `email:${target.trim()}` : `user:${target.trim()}`;
      }
      await adminService.broadcast(title || 'Thông báo hệ thống', message, 'info', audience);
      toast({ status: 'success', title: 'Gửi thông báo thành công' });
      setTitle("");
      setMessage("");
      setTarget("");
      fetchHistory();
    } catch (e) {
      toast({ status: 'error', title: 'Gửi thất bại' });
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await adminService.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (e) {}
  }

  useEffect(() => { fetchHistory(); }, []);

  return (
    <Box>
      <Heading size="md" mb={4}>Trung tâm thông báo</Heading>
      <Box bg={cardBg} p={4} borderRadius="md">
        <Tabs>
          <TabList>
            <Tab>Soạn</Tab>
            <Tab>Lịch sử</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch">
                <Textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung thông báo hệ thống" />
                <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Gửi tới (Email hoặc UserID) - để trống = tất cả" />
                <Button colorScheme="blue" onClick={send}>Gửi</Button>
              </VStack>
            </TabPanel>

            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr><Th>Tiêu đề</Th><Th>Nội dung</Th><Th>Ngày</Th></Tr>
                </Thead>
                <Tbody>
                  {notifications.map(n => (
                    <Tr key={n._id}><Td>{n.title}</Td><Td>{n.message}</Td><Td>{new Date(n.createdAt).toLocaleString()}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}
