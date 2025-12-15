import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Progress, Text } from "@chakra-ui/react";
import adminService from "../../services/adminService";
import LineChartComponent from "../../components/AdminCharts/LineChartComponent.jsx";
import PieChartComponent from "../../components/AdminCharts/PieChartComponent.jsx";

export default function DashboardOverview(){
  const [stats, setStats] = useState(null);
  const [userSeries, setUserSeries] = useState([]);
  const [statusPie, setStatusPie] = useState([]);

  useEffect(() => {
    adminService.getStats().then((res) => {
      const body = res.data || {};
      setStats(body.totals || null);
      setUserSeries(body.usersLast7Days || []);
      setStatusPie(body.propertyStatus || []);
    }).catch(() => {});
  }, []);

  if (!stats) return <Text>Loading...</Text>;

  const { totalListings, totalUsers } = stats;

  return (
    <Box>
      <Heading size="md" mb={4}>Overview</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <Stat p={4} bg="white" borderRadius="md">
          <StatLabel>Total Listings</StatLabel>
          <StatNumber>{totalListings}</StatNumber>
          <Progress mt={2} value={50} colorScheme="blue" />
        </Stat>

        <Stat p={4} bg="white" borderRadius="md">
          <StatLabel>Total Users</StatLabel>
          <StatNumber>{totalUsers}</StatNumber>
          <Progress mt={2} value={50} colorScheme="blue" />
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box>
          <Heading size="sm" mb={2}>New Users (Last 7 days)</Heading>
          <LineChartComponent data={userSeries} />
        </Box>

        <Box>
          <Heading size="sm" mb={2}>Property Status Distribution</Heading>
          <PieChartComponent data={statusPie} />
        </Box>
      </SimpleGrid>
    </Box>
  );
}
