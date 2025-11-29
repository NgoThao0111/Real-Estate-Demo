// Import thêm các thành phần cần thiết
import { createRoot } from "react-dom/client"; 
import { Box, Image, Text, Flex, Badge, IconButton, Global } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons"; // Hoặc icon X của bạn

// 1. Component hiển thị nội dung Popup (Thay thế cho HTML string cũ)
const ListingPopup = ({ item, onClose, onNavigate }) => {
  const imageUrl = item.images?.[0]?.url || "https://via.placeholder.com/150";
  
  return (
    <Box 
      w="280px" 
      bg="white" 
      borderRadius="lg" 
      overflow="hidden" 
      boxShadow="lg"
      position="relative"
      onClick={() => onNavigate(item._id)}
      cursor="pointer"
      _hover={{ bg: "gray.50" }} // Chakra hover style
      className="chakra-popup-card" // Class để debug nếu cần
    >
      {/* Nút Close */}
      <IconButton
        aria-label="Close popup"
        icon={<CloseIcon boxSize={3} />}
        size="xs"
        position="absolute"
        top={2}
        right={2}
        zIndex={2}
        borderRadius="full"
        bg="blackAlpha.600"
        color="white"
        _hover={{ bg: "red.500" }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <Flex>
        {/* Phần ảnh */}
        <Box w="110px" h="90px" flexShrink={0} pos="relative">
          <Image src={imageUrl} alt={item.title} w="100%" h="100%" objectFit="cover" />
          {/* Tag VIP giả lập */}
          <Badge 
            position="absolute" top={1} left={1} 
            colorScheme="red" variant="solid" fontSize="8px"
          >
            VIP
          </Badge>
        </Box>

        {/* Phần thông tin */}
        <Flex direction="column" justify="center" p={2} flex={1} overflow="hidden">
          <Text 
            fontSize="sm" fontWeight="bold" noOfLines={2} lineHeight="short" mb={1}
            title={item.title}
          >
            {item.title}
          </Text>
          <Flex align="baseline" gap={2}>
            <Text color="red.500" fontWeight="extrabold" fontSize="md">
              {item.price || "Liên hệ"}
            </Text>
            <Text color="gray.500" fontSize="xs">
              {item.area ? `(${item.area} m²)` : ""}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};