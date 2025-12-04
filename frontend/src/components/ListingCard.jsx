import { 
  Box, 
  Image, 
  Text, 
  Badge, 
  Stack, 
  IconButton, 
  useToast, 
  useColorModeValue,
  Flex,
  Icon,
  HStack,
  Divider,
  Tooltip
} from "@chakra-ui/react";
import { MdPhotoLibrary } from 'react-icons/md';
import { ImStarEmpty, ImStarFull } from "react-icons/im";
// Import các icon mới
import { FaBed, FaBath } from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";

import { useUserStore } from "../store/user.js";
import { useListStore } from "../store/list.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertyTypeStore } from "../store/propertyType.js";

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const [propertyTypeName, setPropertyTypeName] = useState('');
  const getPropertyTypeById = usePropertyTypeStore((s) => s.getPropertyTypeById);
  
  // Xử lý ảnh (String URL cũ hoặc Cloudinary Object mới)
  const img = listing.images && listing.images.length
    ? typeof listing.images[0] === "string"
      ? listing.images[0]
      : listing.images[0].url
    : null;

  // Ghép chuỗi địa chỉ
  const location = listing.location 
    ? `${listing.location.detail || ''}, ${listing.location.ward || ''}, ${listing.location.province || ''}` 
    : '';
    
  const imgCount = listing.images ? listing.images.length : 0;
  const toast = useToast();

  // Xử lý Lưu/Bỏ lưu
  const savedIds = useUserStore((s) => s.savedListings || []);
  const toggleSave = useUserStore((s) => s.toggleSaveListing);
  const fallbackToggle = useListStore((s) => s.toggleSaveListing);
  const isSaved = savedIds.includes(listing._id);

  // --- HÀM HELPER: Format giá tiền ---
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const amount = Number(price);
    if (isNaN(amount)) return price; // Trả về nguyên gốc nếu không phải số

    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1).replace(/\.0$/, '') + ' tỷ';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + ' triệu';
    } else {
      return amount.toLocaleString('vi-VN') + ' đ';
    }
  };

  // --- HÀM HELPER: Format thời gian tương đối ---
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "Vài giây trước";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} phút trước`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return "Trong hôm nay";
    const day = Math.floor(hour / 24);
    if (day === 1) return "1 ngày trước";
    if (day < 7) return `${day} ngày trước`;
    const week = Math.floor(day / 7);
    if (week < 5) return `${week} tuần trước`;
    const month = Math.floor(day / 30);
    if (month < 12) return `${month} tháng trước`;
    const year = Math.floor(day / 365);
    return `${year} năm trước`;
  };
  
  const lastUpdatedText = formatRelativeTime(listing.updatedAt || listing.createdAt);

  // Lấy tên Loại bất động sản
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!listing?.property_type) {
        if (mounted) setPropertyTypeName("unknown");
        return;
      }
      // Trường hợp đã populate
      if (typeof listing.property_type === "object" && listing.property_type?.name) {
        if (mounted) setPropertyTypeName(listing.property_type.name);
        return;
      }
      // Trường hợp chưa populate (chỉ có ID)
      const id = typeof listing.property_type === "object" ? (listing.property_type._id || listing.property_type) : listing.property_type;

      try {
        const res = await getPropertyTypeById(id);
        if (!mounted) return;
        if (res.success) {
          const data = res.data?.propertyType || res.data;
          setPropertyTypeName(data?.name || "unknown");
        } else {
          setPropertyTypeName("unknown");
        }
      } catch {
        if (mounted) setPropertyTypeName("unknown");
      }
    };
    load();
    return () => { mounted = false; };
  }, [listing.property_type, getPropertyTypeById]);

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      bg={useColorModeValue("white", "gray.800")} 
      shadow="sm"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        shadow: "lg",
        borderColor: "blue.300",
        cursor: "pointer"
      }}
      onClick={() => navigate(`/listings/${listing._id}`)}
    >
      {/* --- PHẦN HÌNH ẢNH --- */}
      <Box position="relative">
        {img ? (
          <Image src={img} alt={listing.title} objectFit="cover" w="100%" h="200px"/>
        ) : (
          <Box w="100%" h="200px" bg={useColorModeValue("gray.200", "gray.600")} display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">No image</Text>
          </Box>
        )}

        {/* Badge thời gian */}
        {lastUpdatedText && (
          <Box position="absolute" bottom={2} left={2} bg="rgba(0,0,0,0.6)" color="white" px={2} py={1} borderRadius="md" fontSize="xs">
            {lastUpdatedText}
          </Box>
        )}

        {/* Badge số lượng ảnh */}
        {imgCount > 0 && (
          <Box position="absolute" bottom={2} right={2} bg="rgba(0,0,0,0.6)" color="white" px={2} py={1} borderRadius="md" fontSize="xs" display="flex" alignItems="center" gap={1}>
            <MdPhotoLibrary size="14px" />
            <Text>{imgCount}</Text>
          </Box>
        )}

        {/* Nút Save/Unsave */}
        <IconButton
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu'}
          icon={isSaved ? <ImStarFull /> : <ImStarEmpty />}
          position="absolute" top={2} right={2}
          size="sm"
          variant="solid"
          color={isSaved ? 'yellow.400' : 'gray.600'}
          bg="white"
          _hover={{ bg: "gray.100", color: "yellow.500" }}
          onClick={async (e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha (navigate)
            try {
              const res = toggleSave ? await toggleSave(listing._id) : await fallbackToggle(listing._id);
              toast({ 
                title: res.success ? res.message : 'Lỗi', 
                status: res.success ? 'success' : 'error', 
                isClosable: true, 
                duration: 2000 
              });
            } catch (err) {
              toast({ title: 'Lỗi kết nối', status: 'error', isClosable: true });
            }
          }}
        />
      </Box>

      {/* --- PHẦN NỘI DUNG --- */}
      <Box p={4}>
        <Stack spacing={1} mb={3}>
          {/* Badge loại BĐS */}
          <Badge colorScheme="blue" width="fit-content" fontSize="0.7em" borderRadius="sm">
            {propertyTypeName}
          </Badge>

          {/* Tiêu đề */}
          <Text fontWeight="bold" fontSize="md" noOfLines={2} lineHeight="1.4" h="2.8em">
            {listing.title}
          </Text>

          {/* Giá tiền */}
          <Text color="blue.600" fontWeight="extrabold" fontSize="lg">
            {formatPrice(listing.price)} {listing.rental_type === "rent" && "/tháng"}
          </Text>

          {/* Địa chỉ (có Tooltip) */}
          <Tooltip label={location} hasArrow placement="top">
            <Text color="gray.500" fontSize="sm" noOfLines={1} cursor="default">
              {location}
            </Text>
          </Tooltip>
        </Stack>

        {/* --- PHẦN THÔNG SỐ (BED - BATH - AREA) --- */}
        <Divider my={3} borderColor="gray.200" />
        
        <Flex justifyContent="space-between" alignItems="center" textAlign="center">
          
          {/* Cột 1: Phòng ngủ */}
          <Flex direction="column" align="center" width="33%">
            <HStack spacing={1}>
                <Icon as={FaBed} color="gray.400" />
                <Text fontWeight="bold" fontSize="md" color="gray.700">
                  {listing.bedroom || 0}
                </Text>
            </HStack>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase" mt="-2px">Ngủ</Text>
          </Flex>

          {/* Vạch ngăn cách */}
          <Box w="1px" h="24px" bg="gray.200" />

          {/* Cột 2: Phòng tắm */}
          <Flex direction="column" align="center" width="33%">
             <HStack spacing={1}>
                <Icon as={FaBath} color="gray.400" />
                <Text fontWeight="bold" fontSize="md" color="gray.700">
                  {listing.bathroom || 0}
                </Text>
            </HStack>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase" mt="-2px">Tắm</Text>
          </Flex>

          {/* Vạch ngăn cách */}
          <Box w="1px" h="24px" bg="gray.200" />

          {/* Cột 3: Diện tích */}
          <Flex direction="column" align="center" width="33%">
             <HStack spacing={1}>
                <Icon as={BsGridFill} color="gray.400" />
                <Text fontWeight="bold" fontSize="md" color="gray.700">
                  {listing.area || 0}
                </Text>
            </HStack>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase" mt="-2px">m²</Text>
          </Flex>

        </Flex>
      </Box>
    </Box>
  );
};

export default ListingCard;