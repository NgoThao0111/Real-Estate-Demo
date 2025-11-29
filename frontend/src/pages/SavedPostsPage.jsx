import { Box, Container, SimpleGrid, Heading, Button, Stack, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import ListingCard from "../components/ListingCard";
import SortViewOpts, { sortListings, filterListings } from "../components/SortViewOpts";

const SavedPostsPage = () => {
  const { fetchSavedListings, toggleSaveListing } = useListStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort listings
  const filteredListings = filterListings(listings, searchQuery);
  const sortedListings = sortListings(filteredListings, sortBy);

  const load = async () => {
    setLoading(true);
    const res = await fetchSavedListings();
    if (res.success) setListings(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onUnsave = async (id) => {
    const res = await toggleSaveListing(id);
    if (res.success) load();
  };

  return (
    <Box py={8}>
      <Container maxW="1140px">
        <Heading 
          size={{ base: "lg", md: "xl" }}
          textAlign="center"
          color={useColorModeValue("gray.900", "white")}
          mb={8}
        >
          Bài đăng đã lưu
        </Heading>

        {/* Sorting and View Options */}
        <SortViewOpts
          listings={filteredListings}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewType={viewType}
          setViewType={setViewType}
          countText="bài đã lưu"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <SimpleGrid 
          columns={viewType === "grid" ? { base: 1, md: 3 } : { base: 1 }} 
          spacing={viewType === "grid" ? 6 : 4}
        >
          {sortedListings.map((l) => (
            <Box key={l._id}>
              <ListingCard listing={l} />
              <Stack direction="row" spacing={2} mt={2}>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onUnsave(l._id)}>Bỏ lưu</Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default SavedPostsPage;
