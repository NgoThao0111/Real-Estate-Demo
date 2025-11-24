import {
  Box,
  Image,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  SimpleGrid,
  AspectRatio,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiPhone, FiMail } from "react-icons/fi";

const getUserDisplayName = (user) => {
  if (!user) return "Người dùng";
  if (user.name) return user.name;
};

const ListingImageSection = ({ listing, onContact }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ["https://via.placeholder.com/600x400?text=No+Image"];

  return (
    <VStack spacing={6} align="stretch">
      {/* Main Image */}
      <Box>
        <AspectRatio ratio={16/10}>
          <Image 
            src={images[selectedImageIndex]} 
            alt={listing.title}
            borderRadius="lg"
            objectFit="cover"
            fallback={<Box bg="gray.100" borderRadius="lg" />}
          />
        </AspectRatio>
        
        {/* Thumbnail Images */}
        {images.length > 1 && (
          <SimpleGrid columns={5} spacing={2} mt={3}>
            {images.map((img, index) => (
              <AspectRatio key={index} ratio={1}>
                <Image
                  src={img}
                  alt={`${listing.title} ${index + 1}`}
                  borderRadius="md"
                  objectFit="cover"
                  cursor="pointer"
                  border={selectedImageIndex === index ? "2px solid" : "1px solid"}
                  borderColor={selectedImageIndex === index ? "blue.500" : "gray.200"}
                  _hover={{ borderColor: "blue.300" }}
                  onClick={() => setSelectedImageIndex(index)}
                  fallback={<Box bg="gray.100" borderRadius="md" />}
                />
              </AspectRatio>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Seller Information */}
      <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200">
        <Heading size="md" mb={4}>Thông tin người đăng</Heading>
        <HStack spacing={4}>
          <Avatar 
            size="lg" 
            name={getUserDisplayName(listing.owner)} 
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="600" fontSize="lg">
              {getUserDisplayName(listing.owner)}
            </Text>
            <Text color="gray.600" fontSize="sm">
              Thành viên từ {new Date(listing.owner?.createdAt || listing.createdAt).getFullYear()}
            </Text>
            <HStack spacing={4} mt={2}>
              <Button leftIcon={<FiPhone />} size="sm" variant="outline">
                Gọi điện
              </Button>
              <Button leftIcon={<FiMail />} size="sm" colorScheme="blue" onClick={onContact}>
                Nhắn tin
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};

export default ListingImageSection;