import { Box, Image, Text, Badge, Stack, Button, IconButton, useToast, useColorModeValue } from "@chakra-ui/react";
import { MdStarBorder, MdStar } from 'react-icons/md';
import { useUserStore } from "../store/user.js";
import { useListStore } from "../store/list.js";

const ListingCard = ({ listing }) => {
  const img = listing.images && listing.images.length ? listing.images[0] : null;
  const address = listing.address ? `${listing.address.detail || ''}, ${listing.address.ward || ''}, ${listing.address.city || ''}` : '';
  const toast = useToast();

  const savedIds = useUserStore((s) => s.savedListings || []);
  const toggleSave = useUserStore((s) => s.toggleSaveListing);
  const fallbackToggle = useListStore((s) => s.toggleSaveListing);
  const isSaved = savedIds.includes(listing._id);

  return (
    <Box 
      borderWidth="2px" 
      borderRadius="lg" 
      overflow="hidden" 
      bg={useColorModeValue("white", "gray.800")} 
      shadow="sm"
      _hover={{
        bg: useColorModeValue("gray.50", "gray.700"),
        shadow: "md",
        borderColor: "blue.300",
      }}
    >
      <Box position="relative">
        {img ? (
          <Image src={img} alt={listing.title} objectFit="cover" w="100%" h="180px"/>
        ) : (
          <Box w="100%" h="200px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">No image</Text>
          </Box>
        )}

        <IconButton
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu'}
          icon={isSaved ? <MdStar /> : <MdStarBorder />}
          position="absolute"
          top={2}
          right={2}
          colorScheme={isSaved ? 'yellow' : 'gray'}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const res = toggleSave ? await toggleSave(listing._id) : await fallbackToggle(listing._id);
              if (res.success) {
                toast({ title: res.message, status: 'success', isClosable: true });
              } else {
                toast({ title: res.message || 'Lỗi', status: 'error', isClosable: true });
              }
            } catch (err) {
              toast({ title: err.message || 'Lỗi khi lưu', status: 'error', isClosable: true });
            }
          }}
        />
      </Box>

      <Box p={4}>
        <Stack spacing={2}>
          <Text 
            fontWeight="bold" 
            fontSize="lg"
            noOfLines={2}
          >
            {listing.title}
          </Text>
          <Text color="blue.600" fontWeight="bold" fontSize={"md"}>
              {listing.price
              ? `${Number(listing.price).toLocaleString("vi-VN")} VNĐ/tháng`
              : "—"}
          </Text>
          <Text color={useColorModeValue("gray.600", "gray.200")} fontSize="sm" noOfLines={2}>
            {address}
          </Text>
        </Stack>

        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
          <Badge colorScheme="green" alignSelf="start">
            {listing.property_type || listing.rental_type}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            {listing.area ? `${listing.area} m²` : ''}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingCard;
