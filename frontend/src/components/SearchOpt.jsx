import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  Button,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";

const SearchOpt = ({ onSearch }) => {
  const contentBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      bg={contentBg}
      p={6}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      shadow="md"
      w="full"
      maxW="400px"
    >
      <Heading as="h3" size="md" mb={6} color={useColorModeValue("gray.800", "white")}>
        Tìm kiếm nâng cao
      </Heading>
      
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Từ khóa"
          size="md"
          bg={useColorModeValue("gray.50", "gray.700")}
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "gray.600")}
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px #3182CE"
          }}
        />

        <Select
          placeholder="Địa điểm"
          size="md"
          bg={useColorModeValue("gray.50", "gray.700")}
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "gray.600")}
          _focus={{
            borderColor: "blue.500"
          }}
        >
          <option value="hanoi">Hà Nội</option>
          <option value="hcm">TP. Hồ Chí Minh</option>
          <option value="danang">Đà Nẵng</option>
          <option value="haiphong">Hải Phòng</option>
        </Select>

        <Select
          placeholder="Danh mục"
          size="md"
          bg={useColorModeValue("gray.50", "gray.700")}
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "gray.600")}
          _focus={{
            borderColor: "blue.500"
          }}
        >
          <option value="apartment">Căn hộ</option>
          <option value="house">Nhà riêng</option>
          <option value="land">Đất nền</option>
          <option value="villa">Biệt thự</option>
        </Select>

        <Select
          placeholder="Phòng ngủ"
          size="md"
          bg={useColorModeValue("gray.50", "gray.700")}
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "gray.600")}
          _focus={{
            borderColor: "blue.500"
          }}
        >
          <option value="1">1 phòng ngủ</option>
          <option value="2">2 phòng ngủ</option>
          <option value="3">3 phòng ngủ</option>
          <option value="4+">4+ phòng ngủ</option>
        </Select>

        <Select
          placeholder="Garage"
          size="md"
          bg={useColorModeValue("gray.50", "gray.700")}
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "gray.600")}
          _focus={{
            borderColor: "blue.500"
          }}
        >
          <option value="0">Không có garage</option>
          <option value="1">1 garage</option>
          <option value="2">2 garage</option>
          <option value="3+">3+ garage</option>
        </Select>

        <Button
          colorScheme="blue"
          size="md"
          w="full"
          onClick={onSearch}
          _hover={{ bg: "blue.600" }}
        >
          Tìm kiếm
        </Button>
      </VStack>
    </Box>
  );
};

export default SearchOpt;