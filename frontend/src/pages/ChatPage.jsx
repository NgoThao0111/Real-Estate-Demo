import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Text, VStack, HStack, Avatar, Heading, useColorModeValue } from "@chakra-ui/react";
import ChatContainer from "../components/ChatContainer";
import { useUserStore } from "../store/user.js";
import { useChatStore } from "../store/chat.js";
import { useSocketContext } from "../context/SocketContext.jsx";

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  if (user.name) return user.name;
  return user.name || user.username || "Người dùng"; 
};

const ChatPage = () => {
  const { user } = useUserStore();
  const { socket } = useSocketContext();
  const { chats, fetchChats, addMessage } = useChatStore();
  const [searchParams] = useSearchParams();
  const [currentChat, setCurrentChat] = useState(null);

  // --- PHẦN SỬA LỖI: KHAI BÁO MÀU SẮC ---
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeBg = useColorModeValue("blue.100", "gray.600"); // Màu khi đang chọn
  const hoverBg = useColorModeValue("gray.100", "gray.600");  // Màu khi di chuột
  // ---------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Khi có tin nhắn bất kỳ tới, cập nhật danh sách chat bên trái
      addMessage(msg);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, addMessage]);

  // Lấy danh sách cuộc hội thoại
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  // Xử lý conversation ID từ URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    // Thêm check an toàn (chats || [])
    if (conversationId && chats?.length > 0) {
      const targetConversation = chats.find(conv => conv._id === conversationId);
      if (targetConversation) {
        setCurrentChat(targetConversation);
      }
    }
  }, [searchParams, chats]);

  return (
    <Box p={5} h="90vh" >
      <Flex gap={5} h="100%">
        
        {/* CỘT TRÁI: DANH SÁCH CHAT (30%) */}
        <Box w="30%" bg={bgBox} borderRadius="lg" boxShadow="sm" overflow="hidden" borderWidth="2px" borderColor={borderColor}>
          <Box p={4} borderBottom="2px" borderColor={borderColor}>
            <Heading size="md">Tin nhắn</Heading>
          </Box>
          
          <VStack align="stretch" spacing={0} overflowY="auto" h="calc(100% - 60px)">
            {/* Check an toàn: chats có thể là null lúc đầu */}
            {(!chats || chats.length === 0) && <Text p={4} color="gray.500">Chưa có tin nhắn nào.</Text>}
            
            {chats?.map((chat) => {
              // SỬA LỖI: Thêm dấu ? cho participants để tránh crash nếu dữ liệu lỗi
              const otherUser = chat.participants?.find(p => p._id !== user?._id);
              const isActive = currentChat?._id === chat._id;

              return (
                <HStack 
                  key={chat._id} 
                  p={4} 
                  cursor="pointer"
                  bg={isActive ? activeBg : "transparent"}
                  _hover={{
                    bg: hoverBg,
                    cursor: "pointer"
                  }}
                  onClick={() => setCurrentChat(chat)}
                  borderBottom="1px" // Giảm xuống 1px cho đẹp hơn
                  borderColor={borderColor}
                >
                  <Avatar src={otherUser?.avatar} name={getUserDisplayName(otherUser)} />
                  <Box flex={1}>
                    <Text fontWeight="bold">{otherUser?.name || otherUser?.username || "Người dùng"}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {chat.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}
                    </Text>
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Box>

        {/* CỘT PHẢI: KHUNG CHAT (70%) */}
        <Box w="70%">
          {currentChat ? (
            <ChatContainer currentChat={currentChat} />
          ) : (
            <Flex 
              h="100%" 
              bg={bgBox}
              borderRadius="lg" 
              align="center" 
              justify="center" 
              direction="column"
              color="gray.400"
              boxShadow="sm"
              overflow="hidden" 
              borderWidth="2px"
              borderColor={borderColor} 
            >
              <Heading size="lg" mb={2}>Chào {user?.name || user?.username} </Heading>
              <Text>Chọn một cuộc hội thoại để bắt đầu chat</Text>
            </Flex>
          )}
        </Box>

      </Flex>
    </Box>
  );
};

export default ChatPage;