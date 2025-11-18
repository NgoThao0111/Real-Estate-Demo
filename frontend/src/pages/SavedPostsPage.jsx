import { Box, Container, SimpleGrid, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import ListingCard from "../components/ListingCard";

const SavedPostsPage = () => {
  const { fetchSavedListings, toggleSaveListing } = useListStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

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
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Heading>Bài đăng đã lưu</Heading>
          <Text color="gray.600">{!loading ? `${listings.length} bài` : 'Đang tải...'}</Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {listings.map((l) => (
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
