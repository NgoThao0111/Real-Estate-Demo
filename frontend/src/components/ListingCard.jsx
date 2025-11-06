import { Box, Image, Text, Badge, Stack, Button } from "@chakra-ui/react";

const ListingCard = ({ listing }) => {
  const img = listing.images && listing.images.length ? listing.images[0] : null;
  const address = listing.address ? `${listing.address.detail || ''}, ${listing.address.ward || ''}, ${listing.address.city || ''}` : '';

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" shadow="sm">
      {img ? (
        <Image src={img} alt={listing.title} objectFit="cover" w="100%" h="200px" />
      ) : (
        <Box w="100%" h="200px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
          <Text color="gray.500">No image</Text>
        </Box>
      )}

      <Box p={4}>
        <Stack spacing={2}>
          <Text fontWeight="bold" fontSize="lg">
            {listing.title}
          </Text>
          <Text color="gray.600" fontSize="sm">
            {address}
          </Text>
          <Text color="blue.600" fontWeight="semibold">
            {listing.price}
          </Text>
          <Badge colorScheme="green" alignSelf="start">
            {listing.property_type || listing.rental_type}
          </Badge>
        </Stack>

        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
          <Button size="sm" colorScheme="blue">
            Xem chi tiết
          </Button>
          <Text fontSize="sm" color="gray.500">
            {listing.area ? `${listing.area} m²` : ''}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingCard;
