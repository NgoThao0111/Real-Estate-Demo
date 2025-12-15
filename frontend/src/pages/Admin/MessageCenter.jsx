import { useState, useEffect } from "react";
import { Box, Heading, Textarea, Button, VStack, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function MessageCenter(){
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const toast = useToast();

  const send = async () => {
    try {
      await adminService.broadcast(title || 'System Notice', message);
      toast({ status: 'success', title: 'Broadcast sent' });
      setTitle("");
      setMessage("");
      fetchHistory();
    } catch (e) {
      toast({ status: 'error', title: 'Failed to send' });
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
      <Heading size="md" mb={4}>Message Center</Heading>
      <Box bg="white" p={4} borderRadius="md">
        <Tabs>
          <TabList>
            <Tab>Compose</Tab>
            <Tab>History</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch">
                <Textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="System notification message" />
                <Button colorScheme="blue" onClick={send}>Broadcast to all online users</Button>
              </VStack>
            </TabPanel>

            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr><Th>Title</Th><Th>Message</Th><Th>Date</Th></Tr>
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
