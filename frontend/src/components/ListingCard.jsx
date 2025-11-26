import { Box, Image, Text, Badge, Stack, Button, IconButton, useToast, useColorModeValue } from "@chakra-ui/react";
import { MdPhotoLibrary } from 'react-icons/md';
import { ImStarEmpty, ImStarFull } from "react-icons/im";
import { useUserStore } from "../store/user.js";
import { useListStore } from "../store/list.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertyTypeStore } from "../store/propertyType.js";

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const [propertyTypeName, setPropertyTypeName] = useState('');
  const getPropertyTypeById = usePropertyTypeStore((s) => s.getPropertyTypeById);
  const img = listing.images && listing.images.length
  ? typeof listing.images[0] === "string"
    ? listing.images[0]            // old string URL
    : listing.images[0].url        // Cloudinary object
  : null;
  const location = listing.location ? `${listing.location.detail || ''}, ${listing.location.ward || ''}, ${listing.location.province || ''}` : '';
  const imgCount = listing.images ? listing.images.length : 0;
  const toast = useToast();

  const savedIds = useUserStore((s) => s.savedListings || []);
  const toggleSave = useUserStore((s) => s.toggleSaveListing);
  const fallbackToggle = useListStore((s) => s.toggleSaveListing);
  const isSaved = savedIds.includes(listing._id);

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // nếu không có loại bất động sản, mặc định là không xác định
      if (!listing?.property_type) {
        if (mounted) setPropertyTypeName("unknown");
        return;
      }

      // đối tượng đã được điền đầy đủ với tên
      if (typeof listing.property_type === "object" && listing.property_type?.name) {
        if (mounted) setPropertyTypeName(listing.property_type.name);
        return;
      }

      // xác định id (có thể là chuỗi hoặc đối tượng có _id)
      const id = typeof listing.property_type === "object" ? (listing.property_type._id || listing.property_type) : listing.property_type;

      try {
        const res = await getPropertyTypeById(id);
        if (!mounted) return;

        if (res.success) {
          // xử lý cả hai dạng: res.data.propertyType hoặc res.data
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
      borderWidth="2px" 
      borderRadius="lg" 
      overflow="hidden" 
      bg={useColorModeValue("white", "gray.800")} 
      shadow="sm"
      _hover={{
        bg: useColorModeValue("gray.50", "gray.700"),
        shadow: "md",
        borderColor: "blue.300",
        cursor: "pointer"
      }}
      onClick={() => navigate(`/listings/${listing._id}`)}
    >
      <Box position="relative">
        {img ? (
          <Image src={img} alt={listing.title} objectFit="cover" w="100%" h="180px"/>
        ) : (
          <Box w="100%" h="180px" bg={useColorModeValue("gray.200", "gray.600")} display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">No image</Text>
          </Box>
        )}

        {lastUpdatedText && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="rgba(0,0,0,0.55)"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
          >
            {lastUpdatedText}
          </Box>
        )}

        {imgCount > 0 && (
          <Box
            position="absolute"
            bottom={2}
            right={2}
            bg="rgba(0,0,0,0.55)"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <MdPhotoLibrary size="14px" />
            <Text>{imgCount} ảnh</Text>
          </Box>
        )}

        <IconButton
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu'}
          icon={isSaved ? <ImStarFull /> : <ImStarEmpty />}
          position="absolute"
          top={2}
          right={2}
          px={2}
          py={2}
          color={isSaved ? 'yellow.400' : 'white'}
          bg="rgba(0,0,0,0.55)"
          _hover={{
            color: 'yellow.400',                          
            bg: "rgba(0,0,0,0.65)"
          }}
          _groupHover={{
            color: 'yellow.400'                           
          }}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const res = toggleSave ? await toggleSave(listing._id) : await fallbackToggle(listing._id);
              if (res.success) {
                toast({ title: res.message, status: 'success', isClosable: true });
              } else {
                toast({ title: res.message || 'Lỗi', status: 'error', isClosable: true });
              }
            } catch (err) {
              toast({ title: err.message || 'Lỗi khi lưu', status: 'error', isClosable: true });
            }
          }}
        />
      </Box>

      <Box p={4}>
        <Stack spacing={2}>
          <Text 
            fontWeight="bold" 
            fontSize="md"
            noOfLines={2}
          >
            {listing.title}
          </Text>
          <Text color="blue.500" fontWeight="bold" fontSize={"md"}>
              {listing.price
              ? `${Number(listing.price).toLocaleString("vi-VN")} ${
                  listing.rental_type === "rent" ? "VNĐ/tháng" : "VNĐ"
                }`
              : "—"}
          </Text>
          <Text color={useColorModeValue("gray.600", "gray.200")} fontSize="sm" noOfLines={2}>
            {location}
          </Text>
        </Stack>

        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
          <Badge colorScheme="green" alignSelf="start">
            {propertyTypeName}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            {listing.area ? `${listing.area} m²` : ''}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingCard;
