import { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Input, Button, Avatar, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import api from "../lib/axios";
import { format } from "timeago.js";

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  if (user.name) return user.name;
};

const ChatContainer = ({ currentChat }) => {
  const { socket } = useSocketContext();
  const { currentUser } = useAuthContext();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // --- 1. KHAI BÁO MÀU SẮC Ở ĐÂY (TRƯỚC KHI return) ---
  // Chakra UI Hooks phải luôn được gọi, không được nằm sau if (loading)
  const containerBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const otherMsgBg = useColorModeValue("gray.200", "gray.700");
  const otherMsgColor = useColorModeValue("black", "white");

  // Lấy thông tin người kia
  const receiver = currentChat?.participants.find((p) => p._id !== currentUser._id);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      setLoading(true);
      try {
        const res = await api.get(`/chats/${currentChat._id}/messages`);
        setMessages(res.data.messages.reverse() || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (!socket || !currentChat?._id) return;
    socket.emit("join_chat", currentChat._id);

    const handleNewMessage = (msg) => {
      const msgConversationId = typeof msg.conversation === 'object' ? msg.conversation._id : msg.conversation;
      if (msgConversationId?.toString() === currentChat._id.toString()) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/chats/${currentChat._id}/messages`, { content: newMessage });
      setNewMessage("");
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // --- 2. KIỂM TRA LOADING (Nằm sau khi đã khai báo hooks) ---
  if (loading) return <Flex justify="center" align="center" h="100%"><Spinner /></Flex>;

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "Vài giây trước";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} phút trước`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return "Trong hôm nay";
    const day = Math.floor(hour / 24);
    if (day === 1) return "1 ngày trước";
    if (day < 7) return `${day} ngày trước`;
    const week = Math.floor(day / 7);
    if (week < 5) return `${week} tuần trước`;
    const month = Math.floor(day / 30);
    if (month < 12) return `${month} tháng trước`;
    const year = Math.floor(day / 365);
    return `${year} năm trước`;
  };

  return (
    <Flex direction="column" h="100%" bg={containerBg} borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="2px">
      {/* HEADER */}

      <Flex align="center" gap={3} p={4} bg={useColorModeValue("gray.50", "gray.700")} borderBottom="2px" borderColor={useColorModeValue("gray.200", "gray.600")}>
        <Avatar src={receiver?.avatar || ""} name={getUserDisplayName(receiver)} />

        <Box>
          <Text fontWeight="bold" fontSize={"lg"}>{receiver?.name}</Text>
          <Text fontSize="sm" fontWeight={"semibold"} color={"gray.500"}>Đang trực tuyến</Text>
        </Box>
      </Flex>

      {/* MESSAGE LIST */}
      <Flex direction="column" flex={1} p={4} gap={3} overflowY="auto" bg={containerBg}>
        {messages.map((msg) => {
          // Check sender id an toàn
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          const isOwn = senderId === currentUser._id;

          return (
            <Flex key={msg._id} justify={isOwn ? "flex-end" : "flex-start"} mb={2}>
              <Box
                maxW="70%"
                // Dùng biến màu đã khai báo ở trên
                bg={isOwn ? "blue.500" : otherMsgBg}
                color={isOwn ? "white" : otherMsgColor}
                p={3}
                borderRadius="lg"
                borderBottomRightRadius={isOwn ? "0" : "lg"}
                borderBottomLeftRadius={isOwn ? "lg" : "0"}
              >
                <Text>{msg.content}</Text>
                <Text fontSize="10px" textAlign="right" mt={1} opacity={0.8}>
                   {formatRelativeTime(msg.createdAt)} 
                </Text>
              </Box>
            </Flex>
          );
        })}
        <div ref={scrollRef} />
      </Flex>

      {/* INPUT AREA */}
      <Flex p={3} borderTop="2px" gap={2} borderColor={borderColor}>
        <Input 
          placeholder="Nhập tin nhắn..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          borderWidth={"2px"}
        />
        <Button colorScheme="blue" onClick={handleSend}>Gửi</Button>
      </Flex>
    </Flex>
  );
};

export default ChatContainer;