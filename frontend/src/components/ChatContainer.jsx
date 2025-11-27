import { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Input, Button, Avatar, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import api from "../lib/axios";
import { useChatStore } from "../store/chat.js";

// Hàm helper format thời gian (giữ nguyên của bạn)
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ trước`;
  const day = Math.floor(hour / 24);
  return `${day} ngày trước`;
};

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  return user.name || user.username || "Người dùng";
};

// SỬA LỖI 1: Thêm isWidget vào props
const ChatContainer = ({ currentChat, isWidget }) => {
  const { socket } = useSocketContext();
  const { currentUser } = useAuthContext();
  const { updateLastMessage } = useChatStore();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // --- HOOKS MÀU SẮC ---
  const containerBg = useColorModeValue("white", "gray.800");
  // const headerBg = useColorModeValue("gray.50", "gray.700"); // Biến này không dùng nữa nếu ẩn header
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const otherMsgBg = useColorModeValue("gray.100", "gray.700"); // Chỉnh màu nhẹ hơn chút cho đẹp
  const otherMsgColor = useColorModeValue("black", "white");

  // Lấy thông tin người kia
  const receiver = currentChat?.participants.find((p) => p._id !== currentUser._id);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      setLoading(true);
      try {
        const res = await api.get(`/chats/${currentChat._id}/messages`);
        const msgs = res.data.messages || [];
        setMessages(msgs.reverse()); // API của bạn có thể trả về thứ tự đúng rồi, nếu ngược thì .reverse()
      } catch (err) {
        console.error(err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentChat]);

  // Socket logic
  useEffect(() => {
    if (!socket || !currentChat?._id) return;
    
    // Join room
    socket.emit("join_chat", currentChat._id);

    const handleNewMessage = (msg) => {
      // Kiểm tra kỹ ID để tránh nhận nhầm tin nhắn từ room khác
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

  // Auto scroll
  useEffect(() => {
    // Timeout nhỏ giúp UI render xong mới scroll để chính xác hơn
    setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100)
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    // OPTIMISTIC UI (Tùy chọn): Hiển thị ngay lập tức để cảm giác nhanh hơn
    // const tempMsg = { _id: Date.now(), content: newMessage, sender: currentUser._id, createdAt: new Date() };
    // setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api.post(`/chats/${currentChat._id}/messages`, { content: newMessage });
      setNewMessage("");
      updateLastMessage(res.data);
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  if (loading) return <Flex justify="center" align="center" h="100%"><Spinner /></Flex>;

  return (
    <Flex 
        direction="column" 
        h="100%" 
        // Nếu là Widget thì padding nhỏ (2), trang to thì (4)
        p={isWidget ? 2 : 4} 
        bg={containerBg} 
        // Nếu là Widget thì bỏ border/radius đi vì thằng cha (ChatWidget) đã lo rồi
        borderRadius={isWidget ? "none" : "lg"} 
        boxShadow={isWidget ? "none" : "sm"} 
        borderWidth={isWidget ? "0px" : "2px"}
        borderColor={borderColor}
    >
      
      {/* SỬA LỖI 2: Ẩn Header nếu đang là Widget */}
      {!isWidget && (
        <Flex align="center" gap={3} p={4} mb={2} borderBottom="2px" borderColor={borderColor}>
            <Avatar src={receiver?.avatar || ""} name={getUserDisplayName(receiver)} />
            <Box>
                <Text fontWeight="bold" fontSize={"lg"}>{getUserDisplayName(receiver)}</Text>
                <Text fontSize="sm" fontWeight={"semibold"} color={"gray.500"}>Đang trực tuyến</Text>
            </Box>
        </Flex>
      )}

      {/* MESSAGE LIST */}
      <Flex direction="column" flex={1} p={2} gap={3} overflowY="auto" >
        {messages.map((msg) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          const isOwn = senderId === currentUser._id;

          return (
            <Flex key={msg._id} justify={isOwn ? "flex-end" : "flex-start"}>
              <Box
                maxW="85%" // Tăng độ rộng tin nhắn lên chút cho dễ đọc
                bg={isOwn ? "blue.500" : otherMsgBg}
                color={isOwn ? "white" : otherMsgColor}
                px={3}
                py={2}
                borderRadius="lg"
                borderBottomRightRadius={isOwn ? "0" : "lg"}
                borderBottomLeftRadius={isOwn ? "lg" : "0"}
              >
                <Text fontSize="md">{msg.content}</Text>
                <Text fontSize="10px" textAlign="right" mt={1} opacity={0.7}>
                   {formatRelativeTime(msg.createdAt)} 
                </Text>
              </Box>
            </Flex>
          );
        })}
        <div ref={scrollRef} />
      </Flex>

      {/* INPUT AREA */}
      <Flex p={2} gap={2} borderTop={isWidget ? "1px solid" : "none"} borderColor={borderColor} pt={3}>
        <Input 
          placeholder="Nhập tin nhắn..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="sm" // Nhỏ lại chút cho gọn
          borderRadius="full"
        />
        <Button size="sm" colorScheme="blue" borderRadius="full" onClick={handleSend} px={6}>
            Gửi
        </Button>
      </Flex>
    </Flex>
  );
};

export default ChatContainer;