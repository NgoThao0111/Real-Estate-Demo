import { useColorModeValue, IconButton, HStack, Select, Flex, Text } from "@chakra-ui/react";
import { ViewIcon, HamburgerIcon } from "@chakra-ui/icons";

const SortViewOpts = ({ 
  listings = [], 
  sortBy, 
  setSortBy, 
  viewType, 
  setViewType,
  countText = "dự án"
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
      <HStack spacing={4} flexWrap="wrap">
        <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
          Hiện đang có {listings.length} {countText}
        </Text>
      </HStack>

      <HStack spacing={4} flexWrap="wrap">
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

        <HStack spacing={2}>
          <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
            Xem:
          </Text>
          <HStack spacing={1}>
            <IconButton
              aria-label="Grid view"
              icon={<HamburgerIcon />}
              size="sm"
              variant={viewType === "grid" ? "solid" : "outline"}
              colorScheme={viewType === "grid" ? "blue" : "gray"}
              onClick={() => setViewType("grid")}
            />
            <IconButton
              aria-label="List view"
              icon={<ViewIcon />}
              size="sm"
              variant={viewType === "list" ? "solid" : "outline"}
              colorScheme={viewType === "list" ? "blue" : "gray"}
              onClick={() => setViewType("list")}
            />
          </HStack>
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

export default SortViewOpts;