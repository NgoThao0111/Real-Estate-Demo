import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Select, HStack, Text } from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function PropertyManager() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService.getListings().then((res) => setListings(res.data.listings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminService.updateListingStatus(id, status);
      setListings((prev) => prev.map(l => l._id === id ? { ...l, status } : l));
    } catch (e) {}
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Property Management</Heading>

      {loading ? <Text>Loading...</Text> : (
        <Box bg="white" borderRadius="md" p={4} overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Price</Th>
                <Th>Area</Th>
                <Th>Type</Th>
                <Th>Province</Th>
                <Th>Status</Th>
                <Th>Owner</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {listings.map((l) => (
                <Tr key={l._id}>
                  <Td>{l.title}</Td>
                  <Td>{l.price}</Td>
                  <Td>{l.area}</Td>
                  <Td>{l.rental_type}</Td>
                  <Td>{l.location?.province}</Td>
                  <Td>{l.status}</Td>
                  <Td>{l.owner?.name || l.owner?.username}</Td>
                  <Td>
                    <HStack>
                      <Button size="sm" colorScheme="green" onClick={() => updateStatus(l._id, 'approved')}>Approve</Button>
                      <Button size="sm" colorScheme="red" variant="ghost" onClick={() => updateStatus(l._id, 'rejected')}>Reject</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  )
}
