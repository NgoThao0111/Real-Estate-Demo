import { useColorModeValue, IconButton, HStack, Select, Flex, Text, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { ViewIcon, HamburgerIcon, SearchIcon } from "@chakra-ui/icons";

const SortViewOpts = ({ 
  listings = [], 
  sortBy, 
  setSortBy, 
  viewType, 
  setViewType,
  countText = "dự án",
  searchQuery = "",
  setSearchQuery
}) => {
  // Define theme-aware colors
  const contentBg = useColorModeValue("white", "gray.800");

  return (
    <Flex
      justify="space-between"
      align="center"
      mb={6}
      flexDirection={{ base: "column", md: "row" }}
      gap={4}
    >
      {/* Search Input on the left */}
      <HStack spacing={4} flexWrap="wrap" flex={1}>
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Tìm kiếm theo tiêu đề, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            size="sm"
            bg={contentBg}
            borderRadius="md"
          />
        </InputGroup>
      </HStack>

      {/* Count, Sort, and View Options on the right */}
      <HStack spacing={4} flexWrap="wrap">
        <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
          Hiện đang có {listings.length} {countText}
        </Text>
        
        <HStack spacing={2}>
          <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
            Sắp xếp:
          </Text>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="sm"
            w="auto"
            minW="140px"
            bg={contentBg}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="area-small">Diện tích nhỏ đến lớn</option>
            <option value="area-large">Diện tích lớn đến nhỏ</option>
          </Select>
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