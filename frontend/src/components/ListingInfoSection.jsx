import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Divider,
  SimpleGrid,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FiMapPin, FiHeart, FiShare2, FiHome, FiMaximize } from "react-icons/fi";

const ListingInfoSection = ({ listing, user, onContact, onSave }) => {
  const toast = useToast();

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return typeof price === 'number' 
      ? price.toLocaleString('vi-VN') + ' VND'
      : price;
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200" position="sticky" top="20px">
      <VStack spacing={4} align="stretch">
        {/* Title and Location */}
        <Box>
          <Heading size="lg" mb={2} lineHeight="short">
            {listing.title}
          </Heading>
          <HStack color="gray.600" fontSize="sm">
            <Icon as={FiMapPin} />
            <Text>
              {listing.location?.detail}, {listing.location?.ward}, {listing.location?.province}
            </Text>
          </HStack>
        </Box>

        {/* Price */}
        <Box>
          <Text fontSize="2xl" fontWeight="700" color="red.500">
            {formatPrice(listing.price)}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {listing.rental_type === 'rent' ? 'Giá thuê' : 'Giá bán'}
          </Text>
        </Box>

        <Divider />

        {/* Property Details */}
        <VStack spacing={3} align="stretch">
          <Text fontWeight="600">Thông tin chi tiết</Text>
          
          <SimpleGrid columns={2} spacing={3}>
            <HStack>
              <Icon as={FiHome} color="gray.500" />
              <Text fontSize="sm">
                <Text as="span" color="gray.500">Loại:</Text>{" "}
                <Badge colorScheme="blue" ml={1}>
                  {listing.property_type?.name || listing.property_type}
                </Badge>
              </Text>
            </HStack>
            
            <HStack>
              <Icon as={FiMaximize} color="gray.500" />
              <Text fontSize="sm">
                <Text as="span" color="gray.500">Diện tích:</Text>{" "}
                {listing.area} m²
              </Text>
            </HStack>
          </SimpleGrid>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>Trạng thái:</Text>
            <Badge 
              colorScheme={listing.status === 'available' ? 'green' : 'red'}
              size="sm"
            >
              {listing.status === 'available' ? 'Còn trống' : 'Đã thuê'}
            </Badge>
          </Box>

          {listing.description && (
            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>Mô tả:</Text>
              <Text fontSize="sm" lineHeight="tall">
                {listing.description}
              </Text>
            </Box>
          )}
        </VStack>

        <Divider />

        {/* Action Buttons */}
        <VStack spacing={3}>
          <Button 
            colorScheme="red" 
            size="lg" 
            width="full"
            onClick={onContact}
            isDisabled={listing.status !== 'available'}
          >
            {listing.rental_type === 'rent' ? 'Thuê ngay' : 'Mua ngay'}
          </Button>
          
          <HStack width="full">
            <Button 
              leftIcon={<FiHeart />} 
              variant="outline" 
              flex={1}
              onClick={onSave}
            >
              Lưu
            </Button>
            <Button 
              leftIcon={<FiShare2 />} 
              variant="outline" 
              flex={1}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Đã sao chép",
                  description: "Đã sao chép liên kết vào clipboard",
                  status: "success",
                  duration: 2000,
                });
              }}
            >
              Chia sẻ
            </Button>
          </HStack>
        </VStack>

        {/* Safety Notice */}
        <Box bg="yellow.50" p={3} borderRadius="md" border="1px solid" borderColor="yellow.200">
          <Text fontSize="xs" color="yellow.800">
            💡 <strong>Lưu ý an toàn:</strong> Hãy kiểm tra kỹ thông tin và gặp trực tiếp để xem nhà trước khi quyết định thuê/mua.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ListingInfoSection;