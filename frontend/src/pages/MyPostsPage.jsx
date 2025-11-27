import { Box, Container, SimpleGrid, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import ListingCard from "../components/ListingCard";
import EditListingModal from "../components/EditListingModal";

const MyPostsPage = () => {
  const { fetchMyListings, deleteListing } = useListStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetchMyListings();
    if (res.success) setListings(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onEdit = (listing) => {
    setSelected(listing);
    setEditOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bài này?')) return;
    const res = await deleteListing(id);
    if (res.success) load();
  };

  return (
    <Box py={8}>
      <Container maxW="1140px">
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Heading>Bài đăng của tôi</Heading>
          <Text color="gray.600">{!loading ? `${listings.length} bài` : 'Đang tải...'}</Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {listings.map((l) => (
            <Box key={l._id}>
              <ListingCard listing={l} />
              <Stack direction="row" spacing={2} mt={2}>
                <Button size="sm" colorScheme="blue" onClick={() => onEdit(l)}>Chỉnh sửa</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(l._id)}>Xóa</Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
        
      </Container>

      <EditListingModal isOpen={editOpen} onClose={() => { setEditOpen(false); load(); }} listing={selected} />
    </Box>
  );
};

export default MyPostsPage;
