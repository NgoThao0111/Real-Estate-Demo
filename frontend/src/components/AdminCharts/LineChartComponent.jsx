import { Box } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LineChartComponent({ data, height = 240 }){
  return (
    <Box bg="white" p={4} borderRadius="md">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3182CE" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
