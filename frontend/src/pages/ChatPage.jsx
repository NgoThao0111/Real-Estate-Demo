import { useEffect, useState } from "react";
import { Box, Flex, Text, VStack, HStack, Avatar, Heading, useColorModeValue } from "@chakra-ui/react";
import ChatContainer from "../components/ChatContainer";
import api from "../lib/axios";
import { useAuthContext } from "../context/AuthContext";

const ChatPage = () => {
  const { currentUser } = useAuthContext();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // --- 1. KHAI BÁO MÀU SẮC TẠI ĐÂY (TOP LEVEL) ---
  // Đưa hết useColorModeValue ra khỏi .map và điều kiện return
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.200", "gray.900");
  const activeBg = useColorModeValue("gray.50", "gray.700");
  
  // Lấy danh sách Chat
  useEffect(() => {
    const getChats = async () => {
      try {
        const res = await api.get("/chats");
        setChats(res.data.conversations || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser) getChats();
  }, [currentUser]);

  return (
    <Box p={5} h="90vh" >
      <Flex gap={5} h="100%">
        
        {/* CỘT TRÁI: DANH SÁCH CHAT (30%) */}
        {/* Sử dụng biến bgBox đã khai báo ở trên */}
        <Box w="30%" bg={bgBox} borderRadius="lg" boxShadow="sm" overflow="hidden" borderWidth="2px" >
          <Box p={4} borderBottom="2px" borderColor={borderColor}>
            <Heading size="md">Tin nhắn</Heading>
          </Box>
          
          <VStack align="stretch" spacing={0} overflowY="auto" h="calc(100% - 60px)">
            {chats.length === 0 && <Text p={4} color="gray.500">Chưa có tin nhắn nào.</Text>}
            
            {chats.map((chat) => {
              // Tìm tên người kia để hiển thị
              const otherUser = chat.participants.find(p => p._id !== currentUser._id);
              const isActive = currentChat?._id === chat._id;

              return (
                <HStack 
                  key={chat._id} 
                  p={4} 
                  cursor="pointer"
                  // Dùng biến activeBg thay vì gọi hook ở đây
                  bg={isActive ? activeBg : "transparent"}
                  _hover={{
                    bg: hoverBg, // Dùng biến hoverBg
                    cursor: "pointer"
                  }}
                  onClick={() => setCurrentChat(chat)}
                  borderBottom="2px"
                  borderColor={borderColor} // Dùng biến borderColor
                >
                  <Avatar src={otherUser?.avatar} name={otherUser?.username} />
                  <Box flex={1}>
                    <Text fontWeight="bold">{otherUser?.username}</Text>
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
              bg={bgBox} // Dùng biến bgBox
              borderRadius="lg" 
              align="center" 
              justify="center" 
              direction="column"
              color="gray.400"
              boxShadow="sm"
              overflow="hidden" 
              borderWidth="2px"
            >
              <Heading size="lg" mb={2}>Chào {currentUser?.username} 👋</Heading>
              <Text>Chọn một cuộc hội thoại để bắt đầu chat</Text>
            </Flex>
          )}
        </Box>

      </Flex>
    </Box>
  );
};

export default ChatPage;