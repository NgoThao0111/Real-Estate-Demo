import { useColorModeValue, IconButton, HStack, Select, Flex, Text } from "@chakra-ui/react";
import { ViewIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FiGrid, FiList } from "react-icons/fi";

const SortViewOpts = ({ 
  listings = [], 
  sortBy, 
  setSortBy, 
  viewType, 
  setViewType,
  countText = "Properties Found"
}) => {
  // Define theme-aware colors
  const contentBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex
      justify="space-between"
      align="center"
      mb={8}
      flexDirection={{ base: "column", md: "row" }}
      gap={6}
      p={4}
      bg={contentBg}
      borderRadius="lg"
      shadow="sm"
    >
      {/* Properties count on the left */}
      <Text color={textColor} fontSize="2xl" fontWeight="bold">
        {listings.length} {countText}
      </Text>

      {/* Sort and View Options on the right */}
      <HStack spacing={6} flexWrap="wrap">
        <HStack spacing={3}>
          <Text color={textColor} fontSize="md" fontWeight="medium">
            Sắp xếp theo
          </Text>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="md"
            w="auto"
            minW="180px"
            bg={contentBg}
            border="1px solid"
            borderColor={useColorModeValue("gray.300", "gray.600")}
            borderRadius="md"
            fontSize="md"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="area-small">Diện tích nhỏ đến lớn</option>
            <option value="area-large">Diện tích lớn đến nhỏ</option>
          </Select>
        </HStack>
        
        <HStack spacing={2}>
          <IconButton
            icon={<FiList size={20} />}
            size="md"
            variant={viewType === "list" ? "solid" : "outline"}
            colorScheme={viewType === "list" ? "blue" : "gray"}
            onClick={() => setViewType("list")}
            aria-label="List view"
          />
          <IconButton
            icon={<FiGrid size={20} />}
            size="md"
            variant={viewType === "grid" ? "solid" : "outline"}
            colorScheme={viewType === "grid" ? "blue" : "gray"}
            onClick={() => setViewType("grid")}
            aria-label="Grid view"
          />
        </HStack>
      </HStack>
    </Flex>
  );
};

// Utility function to sort listings
export const sortListings = (listings, sortBy) => {
  return [...listings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
      case "oldest":
        return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "area-small":
        return (a.area || 0) - (b.area || 0);
      case "area-large":
        return (b.area || 0) - (a.area || 0);
      default:
        return 0;
    }
  });
};

// Utility function to filter listings by search query
export const filterListings = (listings, searchQuery) => {
  if (!searchQuery.trim()) return listings;
  
  const query = searchQuery.toLowerCase().trim();
  return listings.filter((listing) => {
    const title = listing.title?.toLowerCase() || '';
    const location = listing.location ? 
      `${listing.location.detail || ''} ${listing.location.ward || ''} ${listing.location.province || ''}`.toLowerCase() : '';
    
    return title.includes(query) || location.includes(query);
  });
};

export default SortViewOpts;