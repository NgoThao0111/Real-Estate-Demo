import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUsers, FiGrid, FiCheckCircle } from "react-icons/fi";

const HomePageFeature = () => {
  const subText = useColorModeValue("gray.600", "white");
  const aosDuration = 800;
  const aosDelay = 50;

  const features = [
    {
      icon: FiGrid,
      title: "Nguồn lựa chọn đa dạng",
      description: "Hàng nghìn tin đăng đã được kiểm duyệt, dễ dàng tìm được bất động sản phù hợp.",
      delay: 100,
    },
    {
      icon: FiCheckCircle,
      title: "Quy trình liền mạch",
      description: "Ứng dụng công nghệ giúp trải nghiệm mua bán, thuê mướn trở nên suôn sẻ.",
      delay: 200,
    },
    {
      icon: FiUsers,
      title: "Chuyên gia môi giới",
      description: "Đội ngũ tư vấn chuyên nghiệp đồng hành cùng bạn trong mọi bước.",
      delay: 300,
    },
  ];

  return (
    <Box
      bg="transparent"
      py={10}
      borderRadius="xl"
      mb={4}
      overflow="hidden"
      position="relative"
    >
      {/* Animated Text Background */}
      <Box
        position="absolute"
        top="-50px"
        left="0"
        width="200%"
        overflow="hidden"
        pointerEvents="none"
        zIndex={100}
        opacity={1}
        sx={{
          "@keyframes scrollText": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
        }}
      >
        <Text
          fontSize={{ base: "80px", md: "120px", lg: "150px" }}
          fontWeight="900"
          color={useColorModeValue("blue.400", "blue.300")}
          whiteSpace="nowrap"
          animation="scrollText 20s linear infinite"
          sx={{
            textShadow: useColorModeValue(
              "0 2px 10px rgba(59, 130, 246, 0.3)",
              "0 2px 10px rgba(96, 165, 250, 0.5)"
            ),
          }}
        >
          RealEstate Demo RealEstate Demo RealEstate Demo RealEstate Demo
        </Text>
      </Box>

      <Container
        maxW={"1140px"}
        mt={6}
        mb={12}
        position="relative"
        zIndex={5}
        data-aos="fade-up"
        data-aos-duration={aosDuration}
        data-aos-delay={aosDelay}
      >
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
          {/* Left Side - Features */}
          <Box>
            <Box
              textAlign="left"
              mb={8}
              data-aos="fade-right"
              data-aos-duration={aosDuration}
              data-aos-delay={aosDelay}
            >
              <Heading
                as="h3"
                size="xl"
                mb={3}
                data-aos="zoom-in"
                data-aos-duration={aosDuration}
                data-aos-delay={aosDelay}
              >
                Tại sao chọn RealEstate Demo?
              </Heading>
              <Text
                color={subText}
                fontSize="lg"
                data-aos="fade-up"
                data-aos-duration={aosDuration}
                data-aos-delay={aosDelay + 50}
              >
                Đối tác tin cậy giúp bạn tìm bất động sản phù hợp.
              </Text>
            </Box>

            <Box display="flex" flexDirection="column" gap={6}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="start"
                  gap={4}
                  data-aos="fade-right"
                  data-aos-duration={aosDuration}
                  data-aos-delay={aosDelay + feature.delay}
                >
                  <Box
                    minW="56px"
                    h="56px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <feature.icon size={24} color="#2B6CB0" />
                  </Box>
                  <Box>
                    <Heading as="h4" size="md" mb={2}>
                      {feature.title}
                    </Heading>
                    <Text color={subText} fontSize="sm">
                      {feature.description}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Side - Image */}
          <Box
            data-aos="fade-left"
            data-aos-duration={aosDuration}
            data-aos-delay={aosDelay + 200}
            display={{ base: "none", lg: "block" }}
          >
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="2xl"
              position="relative"
              height="500px"
            >
              <Box
                as="img"
                src="/anh-3.jpg"
                alt="Real Estate Demo"
                width="100%"
                height="100%"
                objectFit="cover"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.05)" }}
              />
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default HomePageFeature;
