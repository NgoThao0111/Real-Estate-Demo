import { Box } from "@chakra-ui/react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2B6CB0", "#DD6B20", "#38A169", "#718096"];

export default function PieChartComponent({ data, height = 240 }){
  return (
    <Box bg="white" p={4} borderRadius="md">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie dataKey="value" data={data} nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
