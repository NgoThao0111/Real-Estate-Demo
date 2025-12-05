import React from "react";
import { Box, Image, Text, Flex, IconButton, Icon, Badge, HStack } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  const amount = Number(price);
  if (isNaN(amount)) return price;
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1).replace(/\.0$/, '') + ' tỷ';
  } else if (amount >= 1000000) {
    return (amount / 1000000).toFixed(0) + ' triệu';
  } else {
    return amount.toLocaleString('vi-VN') + ' đ';
  }
};

// Exported ListingPopup used by MapboxMap
const ListingPopup = ({ item, onClose, onNavigate }) => {
  const imageUrl = item.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image";
  const priceText = formatPrice(item.price);
  const areaText = item.area ? `${item.area} m²` : null;
  const locationText = item.address || item.location?.name || "";

  return (
    <Flex
      w="320px"
      bg="white"
      borderRadius="10px"
      overflow="hidden"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      fontFamily="body"
      onClick={() => onNavigate?.(item._id)}
      cursor="pointer"
      role="group"
      _hover={{ boxShadow: 'lg', transform: "scale(1.1)" }}
    >
      <IconButton
        aria-label="Close"
        icon={<CloseIcon boxSize={10} />}
        size="sm"
        variant="ghost"
        position="absolute"
        top={3.5}
        right={3.5}
        zIndex={18}
        color="gray.600"
        bg="white"
        borderRadius="full"
        overflow={"hidden"}
        _hover={{ bg: 'gray.50', transform: "scale(1.25)" }}
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />

      <Flex gap={3} align="center" p={3}>
        <Box position="relative" w="78px" h="78px" flexShrink={0} borderRadius="8px" overflow="hidden" boxShadow="md">
          <Image src={imageUrl} alt="Listing" w="100%" h="100%" objectFit="cover" />
          {(item.isVip || (item.tags || []).includes('vip')) && (
            <Badge position="absolute" left={6} top={6} bg="#0fb4b4" color="white" borderRadius="md" px={2} py={1} fontSize="12px" fontWeight="700">
              VIP
            </Badge>
          )}
        </Box>

        <Box flex={1} minW={0}>
          <Text fontWeight="700" fontSize="16px" color="gray.800" noOfLines={2}>
            {item.title || 'Cho thuê/Cho bán'}
          </Text>

          <Text fontSize="15px" fontWeight="800" color="red.500" mt={1} mb={1}>
            {priceText}
          </Text>

          <HStack spacing={3} alignItems="center" color="gray.500" fontSize="13px">
            {areaText && (
              <HStack spacing={1} alignItems="center">
                <Icon viewBox="0 0 24 24" boxSize={4} color="gray.500">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
                </Icon>
                <Text color="gray.600">{areaText}</Text>
              </HStack>
            )}

            <Text noOfLines={1} flex={1} color="gray.600">
              {locationText}
            </Text>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ListingPopup;