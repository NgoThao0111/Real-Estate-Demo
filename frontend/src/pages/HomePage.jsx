import { Container, SimpleGrid, Spinner, Center, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import ListingCard from "../components/ListingCard";
import { useListStore } from "../store/list.js";

const HomePage = () => {
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
      <Container maxW="container.xl" py={12}>
        <Center>
          <Text color="red.500">{error}</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={12}>
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

export default HomePage;