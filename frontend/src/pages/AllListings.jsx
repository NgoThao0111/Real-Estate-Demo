import { useEffect, useState } from "react";
import { 
  Container, 
  Box, 
  Grid, 
  GridItem,
  SimpleGrid, 
  Spinner, 
  Center, 
  Text, 
  useColorModeValue
} from "@chakra-ui/react";
import ListingCard from "../components/ListingCard";
import SearchOpt from "../components/SearchOpt";
import SortViewOpts, { sortListings, filterListings } from "../components/SortViewOpts";
import { useListStore } from "../store/list.js";
import SlideShow from "../components/SlideShow.jsx";

const AllListings = () => {
  const { listings, loading, error, fetchListings } = useListStore();
  const [sortBy, setSortBy] = useState("newest");
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Filter and sort listings
  const filteredListings = filterListings(listings, searchQuery);
  const sortedListings = sortListings(filteredListings, sortBy);

    if (loading) {
        return (
        <Center minH="60vh">
            <Spinner size="xl" />
        </Center>
        );
    }

    if (error) {
        return (
        <Container maxW={"1140px"} py={12}>
            <Center>
            <Text>{error}</Text>
            </Center>
        </Container>
        );
    }


  return (
    <>
      <SlideShow listings={listings} />
      <Container maxW={"1200px"} py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
          {/* Left Sidebar - Advanced Search */}
          <GridItem>
            <SearchOpt />
          </GridItem>

          {/* Right Content - Listings */}
          <GridItem>
            {/* Sort and View Options */}
            <SortViewOpts
              listings={filteredListings}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewType={viewType}
              setViewType={setViewType}
              countText="dự án đã tìm thấy"
            />

            {/* Listings Grid */}
            {(!sortedListings || sortedListings.length === 0) ? (
              <Center minH="400px">
                <Text fontSize="lg" color="gray.500">Không tìm thấy dự án nào.</Text>
              </Center>
            ) : (
              <SimpleGrid 
                columns={viewType === "grid" ? { base: 1, md: 2 } : { base: 1 }} 
                spacing={6}
              >
                {sortedListings.map((l, index) => (
                  <Box
                    key={l._id || l.id}
                    data-aos="fade-up"
                    data-aos-duration="400"
                    data-aos-delay={index * 100}
                  >
                    <ListingCard listing={l} />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default AllListings;
