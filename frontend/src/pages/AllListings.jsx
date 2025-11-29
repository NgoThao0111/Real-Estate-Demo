import { useEffect, useState } from "react";
import { Container, SimpleGrid, Spinner, Center, Text, Heading, useColorModeValue } from "@chakra-ui/react";
import ListingCard from "../components/ListingCard";
import SlideShow from "../components/SlideShow";
import SortViewOpts, { sortListings } from "../components/SortViewOpts";
import { useListStore } from "../store/list.js";

const AllListings = () => {
  const { listings, loading, error, fetchListings } = useListStore();
  const [sortBy, setSortBy] = useState("newest");
  const [viewType, setViewType] = useState("grid");

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Sort listings using the utility function
  const sortedListings = sortListings(listings, sortBy);

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
      <Container maxW={"1140px"} py={12}>
        <Heading
          size={{ base: "lg", md: "xl" }}
          textAlign="center"
          color={useColorModeValue("gray.900", "white")}
          mb={8}
        >
          Tất cả bài đăng
        </Heading>

        {/* Sorting and View Options */}
        <SortViewOpts
          listings={listings}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewType={viewType}
          setViewType={setViewType}
          countText="dự án"
        />
        {(!sortedListings || sortedListings.length === 0) ? (
          <Center>
            <Text>Chưa có bài đăng nào.</Text>
          </Center>
        ) : (
          <SimpleGrid 
            columns={viewType === "grid" ? { base: 1, sm: 2, md: 4 } : { base: 1 }} 
            spacing={viewType === "grid" ? 6 : 4}
          >
            {sortedListings.map((l) => (
              <ListingCard key={l._id || l.id} listing={l} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};

export default AllListings;
