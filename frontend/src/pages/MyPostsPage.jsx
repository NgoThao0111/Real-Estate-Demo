import { Box, SimpleGrid, VStack, Heading, Button, Stack, useColorModeValue, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useListStore } from "../store/list.js";
import ListingCard from "../components/ListingCard";
import HorizontalListingCard from "../components/HorizontalListingCard";
import CreateListingModal from "../components/CreateListingModal.jsx";
import SortViewOpts, { sortListings, filterListings } from "../components/SortViewOpts";
import PostsNavigationPanel from "../components/PostsNavigationPanel";

const MyPostsPage = () => {
  const { fetchMyListings, deleteListing } = useListStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort listings
  const filteredListings = filterListings(listings, searchQuery);
  const sortedListings = sortListings(filteredListings, sortBy);

  const load = async () => {
    setLoading(true);
    const res = await fetchMyListings();
    if (res.success) setListings(res.data || []);
    setLoading(false);
  };

  useEffect(() => { 
    AOS.init({ duration: 800, once: true });
    load(); 
  }, []);

  const onEdit = (listing) => {
    setSelected(listing);
    setEditOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bài này?')) return;
    const res = await deleteListing(id);
    if (res.success) load();
  };

  const mainBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex minH="100vh">
      {/* Left Navigation Panel */}
      <PostsNavigationPanel />

      {/* Main Content */}
      <Box flex={1} p={6} bg={mainBg}>
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
          listings={filteredListings}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewType={viewType}
          setViewType={setViewType}
          countText="bài đăng"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {viewType === "list" ? (
          <VStack spacing={6} align="stretch">
            {sortedListings.map((l, index) => (
              <Box key={l._id} data-aos="fade-up" data-aos-delay={index * 30}>
                <HorizontalListingCard listing={l} />
                <Stack direction="row" spacing={2} mt={2}>
                  <Button size="sm" colorScheme="blue" onClick={() => onEdit(l)}>Chỉnh sửa</Button>
                  <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(l._id)}>Xóa</Button>
                </Stack>
              </Box>
            ))}
          </VStack>
        ) : (
          <SimpleGrid 
            columns={{ base: 1, md: 3 }} 
            spacing={6}
          >
            {sortedListings.map((l, index) => (
              <Box key={l._id} data-aos="fade-up" data-aos-delay={index * 60}>
                <ListingCard listing={l} />
                <Stack direction="row" spacing={2} mt={2}>
                  <Button size="sm" colorScheme="blue" onClick={() => onEdit(l)}>Chỉnh sửa</Button>
                  <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(l._id)}>Xóa</Button>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <CreateListingModal isOpen={editOpen} onClose={() => { setEditOpen(false); load(); }} defaultValues={selected} />
      </Box>
    </Flex>
  );
};

export default MyPostsPage;
