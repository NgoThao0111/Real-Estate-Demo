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

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  return user.name || user.username || "Người dùng";
};

const ChatWidget = () => {
  const { user } = useUserStore();
  const { conversations, getConversations } = useChatStore();

  // State quản lý đóng mở widget
  const [isOpen, setIsOpen] = useState(false);

  // State quản lý đang xem list hay xem chat cụ thể
  const [currentChat, setCurrentChat] = useState(null);

  // --- KHAI BÁO MÀU SẮC (HOOKS) Ở ĐẦU COMPONENT ---
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.600", "blue.500");
  const textColor = useColorModeValue("white", "white");
  const hoverBg = useColorModeValue("gray.100", "gray.700"); // Đưa ra ngoài vòng lặp

  // Lấy danh sách tin nhắn khi user login
  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user, getConversations]);

  // Toggle đóng mở widget
  const toggleWidget = () => setIsOpen(!isOpen);

  // Hàm quay lại danh sách
  const handleBackToList = () => setCurrentChat(null);

  if (!user) return null;

  return (
    <>
      {/* 1. Nút tròn ở góc màn hình */}
      {!isOpen && (
        <IconButton
          icon={<ChatIcon w={6} h={6} />}
          isRound={true}
          size="lg"
          colorScheme="blue"
          position="fixed" // Đã sửa lỗi chính tả positon
          bottom="30px"
          right="30px"
          zIndex="9999"
          boxShadow="lg"
          onClick={toggleWidget}
          aria-label="Open Chat"
          animation="bounce 2s infinite"
        ></IconButton>
      )}

      {/* 2. Khung chat window (popup) */}
      <SlideFade in={isOpen} offsetY="20px">
        <Box
          position="fixed"
          bottom={isOpen ? "30px" : "-100px"}
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
          {/* Header của widget */}
          <Flex
            bg={headerBg}
            p={3}
            align="center"
            justify="space-between"
            color={textColor}
            boxShadow="sm"
          >
            <HStack>
              {/* Nếu đang chat thì hiện nút Back, không thì hiện Text */}
              {currentChat ? (
                <IconButton
                  icon={<ArrowBackIcon />}
                  variant="ghost"
                  color="white"
                  size="sm"
                  _hover={{ bg: "whiteAlpha.300" }}
                  onClick={handleBackToList}
                />
              ) : null}

              <Text fontWeight="bold" fontSize="md">
                {currentChat
                  ? getUserDisplayName(
                      // Đã sửa participant -> participants
                      currentChat.participants?.find((p) => p._id !== user.id)
                    )
                  : "Tin nhắn"}
              </Text>
            </HStack>

            {/* Nút đóng/thu nhỏ */}
            <IconButton
              icon={<ChevronDownIcon w={6} h={6} />}
              variant="ghost"
              color="white"
              size="sm"
              onClick={toggleWidget}
              _hover={{ bg: "whiteAlpha.300" }}
            />
          </Flex>

          {/* BODY CỦA WIDGET */}
          <Box
            flex={1}
            overflowY="auto"
            bg={useColorModeValue("gray.50", "gray.900")}
          >
            {/* TRƯỜNG HỢP 1: HIỆN DANH SÁCH TIN NHẮN */}
            {!currentChat && (
              <VStack align="stretch" spacing={0}>
                {conversations?.length === 0 && (
                  <Text p={5} textAlign="center" color="gray.500" fontSize="sm">
                    Chưa có cuộc hội thoại nào.
                  </Text>
                )}
                
                {conversations?.map((chat) => {
                  // Đã sửa participant -> participants
                  const otherUser = chat.participants?.find(
                    (p) => p._id !== user?.id
                  );
                  return (
                    <HStack
                      key={chat._id}
                      p={3}
                      cursor="pointer"
                      bg="transparent" // Đã sửa lỗi chính tả transparrent
                      _hover={{ bg: hoverBg }} // Sử dụng biến hoverBg đã khai báo ở trên
                      onClick={() => setCurrentChat(chat)}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                    >
                      <Avatar
                        size="sm"
                        src={otherUser?.avatar}
                        name={getUserDisplayName(otherUser)}
                      />
                      <Box flex={1} overflow="hidden">
                        <Text fontWeight="bold" fontSize="sm">
                          {getUserDisplayName(otherUser)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {chat.lastMessage?.content || "Hình ảnh/File..."}
                        </Text>
                      </Box>
                    </HStack>
                  );
                })}
              </VStack>
            )}

            {/* TRƯỜNG HỢP 2: HIỆN KHUNG CHAT CHI TIẾT */}
            {currentChat && (
              <Box h="100%">
                {/* Truyền prop isWidget={true} để ChatContainer biết */}
                <ChatContainer currentChat={currentChat} isWidget={true} />
              </Box>
            )}
          </Box>
        </Box>
      </SlideFade>
    </>
  );
};

export default ChatWidget;