import { useEffect } from "react";
import { Container, SimpleGrid, Spinner, Center, Text, Heading } from "@chakra-ui/react";
import ListingCard from "../components/ListingCard";
import { useListStore } from "../store/list.js";

const AllListings = () => {
  const { listings, loading, error, fetchListings } = useListStore();

    useEffect(() => {
    fetchListings();
    }, [fetchListings]);

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
    <Container maxW={"1140px"} py={12}>
      {(!listings || listings.length === 0) ? (
        <Center>
          <Text>Chưa có bài đăng nào.</Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
          {listings.map((l) => (
            <ListingCard key={l._id || l.id} listing={l} />
          ))}
        </SimpleGrid>
      )}
      </Container>
  );
};

export default AllListings;
