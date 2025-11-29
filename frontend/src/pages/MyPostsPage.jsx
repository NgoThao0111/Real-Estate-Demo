import { Box, Container, SimpleGrid, Heading, Button, Stack, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import ListingCard from "../components/ListingCard";
import CreateListingModal from "../components/CreateListingModal.jsx";
import SortViewOpts, { sortListings } from "../components/SortViewOpts";

const MyPostsPage = () => {
  const { fetchMyListings, deleteListing } = useListStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewType, setViewType] = useState("grid");

  // Sort listings using the utility function
  const sortedListings = sortListings(listings, sortBy);

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
        <Heading 
          size={{ base: "lg", md: "xl" }}
          textAlign="center"
          color={useColorModeValue("gray.900", "white")}
          mb={8}
        >
          Bài đăng của tôi
        </Heading>

        {/* Sorting and View Options */}
        <SortViewOpts
          listings={listings}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewType={viewType}
          setViewType={setViewType}
          countText="bài đăng"
        />

        <SimpleGrid 
          columns={viewType === "grid" ? { base: 1, md: 3 } : { base: 1 }} 
          spacing={viewType === "grid" ? 6 : 4}
        >
          {sortedListings.map((l) => (
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

      <CreateListingModal isOpen={editOpen} onClose={() => { setEditOpen(false); load(); }} defaultValues={selected} />
    </Box>
  );
};

export default MyPostsPage;
