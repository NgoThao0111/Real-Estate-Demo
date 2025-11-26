import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Text, VStack, HStack, Avatar, Heading, useColorModeValue } from "@chakra-ui/react";
import ChatContainer from "../components/ChatContainer";
import { useUserStore } from "../store/user.js";
import { useChatStore } from "../store/chat.js";

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  if (user.name) return user.name;
};

const ChatPage = () => {
  const { user } = useUserStore();
  const { conversations, getConversations } = useChatStore();
  const [searchParams] = useSearchParams();
  const [currentChat, setCurrentChat] = useState(null);


  // Lấy danh sách cuộc hội thoại
  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user, getConversations]);

  // Xử lý conversation ID từ URL parameter

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv._id === conversationId);
      if (targetConversation) {
        setCurrentChat(targetConversation);
      }
    }
  }, [searchParams, conversations]);

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
            {conversations.length === 0 && <Text p={4} color="gray.500">Chưa có tin nhắn nào.</Text>}
            
            {conversations.map((chat) => {
              // Tìm tên người đối phương để hiển thị
              const otherUser = chat.participants.find(p => p._id !== user?.id);
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
                  <Avatar src={otherUser?.avatar} name={getUserDisplayName(otherUser)} />
                  <Box flex={1}>
                    <Text fontWeight="bold">{otherUser?.name}</Text>
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
              <Heading size="lg" mb={2}>Chào {user?.username} 👋</Heading>
              <Text>Chọn một cuộc hội thoại để bắt đầu chat</Text>
            </Flex>
          )}
        </Box>

      </Flex>
    </Box>
  );
};

export default ChatPage;