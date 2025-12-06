import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import {
  ChatIcon,
  ArrowBackIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import ChatContainer from "./ChatContainer.jsx";
import { useUserStore } from "../store/user.js";
import { useChatStore } from "../store/chat.js";

// Helper lấy tên hiển thị an toàn
const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  return user.name || user.username || "Người dùng";
};

const ChatWidget = () => {
  const { user } = useUserStore();
  
  // --- SỬA LỖI Ở ĐÂY: Dùng chats và fetchChats ---
  const { chats, fetchChats } = useChatStore(); 

  const [isOpen, setIsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);

  // --- THEME COLORS ---
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.600", "blue.500");
  const textColor = "white"; 
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const bodyBg = useColorModeValue("gray.50", "gray.900");
  const msgColor = useColorModeValue("gray.600", "gray.400");

  // Lấy danh sách tin nhắn khi user login
  useEffect(() => {
    if (user) {
      fetchChats(); // --- SỬA LỖI: Gọi fetchChats
    }
  }, [user, fetchChats]);

  const toggleWidget = () => setIsOpen(!isOpen);
  const handleBackToList = () => setCurrentChat(null);

  if (!user) return null;

  const currentUserId = user.id || user._id;

  return (
    <>
      {/* 1. Nút tròn mở chat */}
      {!isOpen && (
        <IconButton
          icon={<ChatIcon w={6} h={6} />}
          isRound={true}
          size="lg"
          colorScheme="blue"
          position="fixed"
          bottom="30px"
          right="30px"
          zIndex="9999"
          boxShadow="lg"
          onClick={toggleWidget}
          aria-label="Open Chat"
          animation="bounce 2s infinite"
          sx={{
            "@keyframes bounce": {
              "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
              "40%": { transform: "translateY(-10px)" },
              "60%": { transform: "translateY(-5px)" },
            },
          }}
        />
      )}

      {/* 2. Khung chat window */}
      <SlideFade in={isOpen} offsetY="20px" unmountOnExit={false}>
        <Box
          position="fixed"
          bottom={isOpen ? "30px" : "-500px"}
          right="30px"
          w="350px"
          h="500px"
          bg={bgBox}
          boxShadow="2xl"
          borderRadius="xl"
          zIndex="9999"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          display={isOpen ? "flex" : "none"}
          flexDirection="column"
        >
          {/* HEADER */}
          <Flex
            bg={headerBg}
            p={3}
            align="center"
            justify="space-between"
            color={textColor}
            boxShadow="sm"
          >
            <HStack>
              {currentChat && (
                <IconButton
                  icon={<ArrowBackIcon />}
                  variant="ghost"
                  color="white"
                  size="sm"
                  _hover={{ bg: "whiteAlpha.300" }}
                  onClick={handleBackToList}
                  aria-label="Back"
                />
              )}

              <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                {currentChat
                  ? getUserDisplayName(
                      currentChat.participants?.find((p) => (p._id || p.id) !== currentUserId)
                    )
                  : "Tin nhắn"}
              </Text>
            </HStack>

            <IconButton
              icon={<ChevronDownIcon w={6} h={6} />}
              variant="ghost"
              color="white"
              size="sm"
              onClick={toggleWidget}
              _hover={{ bg: "whiteAlpha.300" }}
              aria-label="Close"
            />
          </Flex>

          {/* BODY */}
          <Box flex={1} overflowY="auto" bg={bodyBg}>
            {/* VIEW 1: DANH SÁCH CHAT */}
            {!currentChat && (
              <VStack align="stretch" spacing={0}>
                {/* SỬA LỖI: Dùng biến chats thay vì conversations */}
                {(!chats || chats.length === 0) && (
                  <Text p={5} textAlign="center" color="gray.500" fontSize="sm">
                    Chưa có cuộc hội thoại nào.
                  </Text>
                )}

                {chats?.map((chat) => {
                  const otherUser = chat.participants?.find(
                    (p) => (p._id || p.id) !== currentUserId
                  );
                  
                  return (
                    <HStack
                      key={chat._id}
                      p={3}
                      cursor="pointer"
                      bg="transparent"
                      _hover={{ bg: hoverBg }}
                      onClick={() => setCurrentChat(chat)}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      transition="background 0.2s"
                    >
                      <Avatar
                        size="sm"
                        src={otherUser?.avatar || ""}
                        name={getUserDisplayName(otherUser)}
                      />
                      <Box flex={1} overflow="hidden">
                        <HStack justify="space-between">
                            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {getUserDisplayName(otherUser)}
                            </Text>
                        </HStack>
                        
                        <Text fontSize="xs" color={msgColor} noOfLines={1}>
                          {chat.lastMessage?.sender === currentUserId ? "Bạn: " : ""}
                          {chat.lastMessage?.content || "Bắt đầu trò chuyện..."}
                        </Text>
                      </Box>
                    </HStack>
                  );
                })}
              </VStack>
            )}

            {/* VIEW 2: KHUNG CHAT CHI TIẾT */}
            {currentChat && (
              <Box h="100%">
                <ChatContainer 
                    currentChat={currentChat} 
                    isWidget={true} 
                    onClose={handleBackToList}
                />
              </Box>
            )}
          </Box>
        </Box>
      </SlideFade>
    </>
  );
};

export default ChatWidget;