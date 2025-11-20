import { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Input, Button, Avatar, Spinner } from "@chakra-ui/react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import api from "../lib/axios";
import { format } from "timeago.js"; // Gợi ý: Cài thêm `npm install timeago.js` để hiện "5 phút trước"

const ChatContainer = ({ currentChat }) => {
  const { socket } = useSocketContext();
  const { currentUser } = useAuthContext();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Lấy thông tin người kia để hiển thị Avatar/Tên
  const receiver = currentChat?.participants.find((p) => p._id !== currentUser._id);

  // 1. Load tin nhắn cũ khi chọn hội thoại khác
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      setLoading(true);
      try {
        const res = await api.get(`/chats/${currentChat._id}/messages`);
        // Giả sử backend trả về { message: [...] } (như controller bạn viết)
        setMessages(res.data.messages.reverse() || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentChat]);

  // 2. REAL-TIME: Lắng nghe tin nhắn mới & Join Room
  useEffect(() => {
    if (!socket || !currentChat?._id) return;

    // Join room
    socket.emit("join_chat", currentChat._id);

    // Lắng nghe tin mới
    const handleNewMessage = (msg) => {
      if (msg.conversation === currentChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, currentChat]);

  // 3. Auto Scroll xuống cuối
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Gửi tin nhắn
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      // Gọi API POST (Backend sẽ tự bắn Socket)
      await api.post(`/chats/${currentChat._id}/messages`, {
        content: newMessage,
      });
      
      setNewMessage(""); // Xóa ô nhập
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
    }
  };

  // Xử lý nhấn Enter để gửi
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  if (loading) return <Flex justify="center" align="center" h="100%"><Spinner /></Flex>;

  return (
    <Flex direction="column" h="100%" bg="white" borderRadius="lg" overflow="hidden">
      {/* HEADER */}
      <Flex align="center" gap={3} p={4} bg="gray.100" borderBottom="1px solid #e2e8f0">
        <Avatar src={receiver?.avatar || ""} name={receiver?.username} />
        <Box>
          <Text fontWeight="bold">{receiver?.username}</Text>
          <Text fontSize="xs" color="green.500">Đang trực tuyến</Text> {/* Sau này làm logic online thật sau */}
        </Box>
      </Flex>

      {/* MESSAGE LIST */}
      <Flex direction="column" flex={1} p={4} gap={3} overflowY="auto" bg="#fdfdfd">
        {messages.map((msg) => {
          const isOwn = msg.sender._id === currentUser._id;
          return (
            <Flex key={msg._id} justify={isOwn ? "flex-end" : "flex-start"} mb={2}>
              <Box
                maxW="70%"
                bg={isOwn ? "blue.500" : "gray.200"}
                color={isOwn ? "white" : "black"}
                p={3}
                borderRadius="lg"
                borderBottomRightRadius={isOwn ? "0" : "lg"}
                borderBottomLeftRadius={isOwn ? "lg" : "0"}
              >
                <Text>{msg.content}</Text>
                <Text fontSize="10px" textAlign="right" mt={1} opacity={0.8}>
                   {/* Nếu chưa cài timeago thì dùng new Date().toLocaleTimeString() */}
                   {format(msg.createdAt)} 
                </Text>
              </Box>
            </Flex>
          );
        })}
        <div ref={scrollRef} />
      </Flex>

      {/* INPUT AREA */}
      <Flex p={3} borderTop="1px solid #e2e8f0" gap={2}>
        <Input 
          placeholder="Nhập tin nhắn..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button colorScheme="blue" onClick={handleSend}>Gửi</Button>
      </Flex>
    </Flex>
  );
};

export default ChatContainer;