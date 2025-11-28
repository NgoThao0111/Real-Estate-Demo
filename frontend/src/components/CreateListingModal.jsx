import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Textarea,
  Select,
  HStack,
  useToast,
  Spinner,
  Text,
  Box,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import { usePropertyTypeStore } from "../store/propertyType.js";
import MapboxMap from "../components/MapboxMap.jsx";

const CreateListingModal = ({ isOpen, onClose, defaultValues = {} }) => {
  const toast = useToast();
  const createListing = useListStore((s) => s.createListing);
  const updateListing = useListStore((s) => s.updateListing);
  const isEdit = Boolean(defaultValues?._id);

  //Load Property Types
  const {
    propertyTypes,
    loading: loadingTypes,
    error: errorTypes,
    fetchPropertyTypes,
  } = usePropertyTypeStore();

  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    area: "",
    price: "",
    status: "available",
    property_type: "",
    rental_type: "rent",
    images: [],
    location: {
      province: "",
      ward: "",
      detail: "",
      longitude: "",
      latitude: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  //Merge defaultValues an toàn
  useEffect(() => {
    if (isOpen) {
      const existingCoords = defaultValues.location?.coords?.coordinates;

      setForm((prev) => ({
        ...prev,
        ...defaultValues,
        property_type:
          typeof defaultValues.property_type === "object"
            ? defaultValues.property_type._id
            : defaultValues.property_type || "",
        images: defaultValues.images || [],
        location: {
          ...prev.location,
          ...(defaultValues.location || {}),
          longitude: existingCoords ? existingCoords[0] : "",
          latitude: existingCoords ? existingCoords[1] : "",
        },
      }));
    }
  }, [isOpen, JSON.stringify(defaultValues)]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lng, lat, address) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        longitude: lng,
        latitude: lat,
      },
    }));
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);

    // convert each file to a base64 promise
    const toBase64 = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

    // wait for ALL files to finish reading
    const base64Images = await Promise.all(files.map((file) => toBase64(file)));

    // update state
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...base64Images], // append
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.price ||
      !form.location.province ||
      !form.location.detail
    ) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền tiêu đề, giá và địa chỉ.",
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (!form.location.longitude || !form.location.latitude) {
      toast({
        title: "Thiếu vị trí bản đồ",
        description: "Vui lòng chọn vị trí trên bản đồ",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    if (!form.property_type) {
      toast({
        title: "Thiếu loại tài sản",
        description: "Bạn phải chọn loại tài sản.",
        status: "error",
      });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      area: form.area,
      price: form.price,
      status: form.status,
      property_type: form.property_type,
      rental_type: form.rental_type,
      images: form.images,
      location: {
        province: form.location.province,
        ward: form.location.ward,
        detail: form.location.detail,
        longitude: form.location.longitude,
        latitude: form.location.latitude,
      },
    };

    try {
      setSubmitting(true);
      let res;

      if (isEdit) {
        // Cập nhật listing
        res = await updateListing(defaultValues._id, payload);
      } else {
        // Tạo mới listing
        res = await createListing(payload);
      }

      if (res.success) {
        toast({
          title: isEdit ? "Cập nhật thành công" : "Tạo bài đăng thành công",
          description: "Tạo bài đăng thành công.",
          status: "success",
        });

        onClose();
        // Reset form
        setForm({
          title: "",
          description: "",
          area: "",
          price: "",
          status: "available",
          property_type: "",
          rental_type: "rent",
          images: [],
          location: {
            province: "",
            ward: "",
            detail: "",
            longitude: "",
            latitude: "",
          },
        });
      } else {
        toast({
          title: "Lỗi",
          description: res.message || "Thao tác thất bại.",
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Thao tác thất bại.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getInitialCoords = () => {
    if (form.location.longitude && form.location.latitude) {
      return [
        parseFloat(form.location.longitude),
        parseFloat(form.location.latitude),
      ];
    }
    return [105.854444, 21.028511]; //Hà nội
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {isEdit ? "Cập nhật bài đăng" : "Tạo bài đăng mới"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Tiêu đề */}
            <FormControl isRequired>
              <FormLabel>Tiêu đề</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} />
            </FormControl>

            {/* Mô tả */}
            <FormControl>
              <FormLabel>Mô tả</FormLabel>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </FormControl>

            {/* Diện tích & Giá */}
            <HStack>
              <FormControl>
                <FormLabel>Diện tích (m²)</FormLabel>
                <Input name="area" value={form.area} onChange={handleChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Giá</FormLabel>
                <Input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </FormControl>
            </HStack>

            {/* Loại tài sản & rental type */}
            <HStack>
              <FormControl isRequired>
                <FormLabel>Loại tài sản</FormLabel>
                {loadingTypes ? (
                  <Spinner />
                ) : errorTypes ? (
                  <Text color="red.400">Không tải được loại tài sản</Text>
                ) : (
                  <Select
                    name="property_type"
                    value={form.property_type}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn một loại --</option>
                    {propertyTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Loại cho thuê</FormLabel>
                <Select
                  name="rental_type"
                  value={form.rental_type}
                  onChange={handleChange}
                >
                  <option value="rent">Cho thuê</option>
                  <option value="sale">Bán</option>
                </Select>
              </FormControl>
            </HStack>

            {/* Ảnh */}
            <FormControl>
              <HStack justify="space-between" mb={2}>
                <FormLabel m={0}>Ảnh (chọn nhiều ảnh)</FormLabel>
                <Button
                  as="label"
                  htmlFor="images-upload"
                  colorScheme="blue"
                  size="sm"
                  cursor="pointer"
                >
                  Chọn ảnh
                </Button>
              </HStack>

              <Input
                id="images-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                display={"none"}
              />

              {form.images.length > 0 && (
                <Box mt={2} display="flex" gap={3} flexWrap="wrap">
                  {form.images.map((img, idx) => (
                    <Box
                      key={idx}
                      position="relative"
                      boxSize="80px"
                      borderRadius="md"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.300"
                    >
                      <Image
                        src={typeof img === "string" ? img : img.url}
                        alt={`image-${idx}`}
                        boxSize="80px"
                        objectFit="cover"
                      />
                      <IconButton
                        icon={<FiX />}
                        size="xs"
                        aria-label="remove"
                        position="absolute"
                        top="4px"
                        right="4px"
                        borderRadius="full"
                        bg="whiteAlpha.800"
                        _hover={{ bg: "white", transform: "scale(1.1)" }}
                        color="red.500"
                        boxShadow="sm"
                        onClick={() => removeImage(idx)}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            {/* --- PHẦN ĐỊA CHỈ & BẢN ĐỒ (Đã cập nhật) --- */}
            <Box borderTop="1px solid #eee" pt={4}>
              <Text fontWeight="bold" mb={3}>
                Địa chỉ & Vị trí
              </Text>

              <FormControl isRequired mb={3}>
                <FormLabel fontSize="sm">Thành phố</FormLabel>
                <Input
                  name="location.province"
                  value={form.location.province}
                  onChange={handleChange}
                />
              </FormControl>

              <HStack mb={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Phường</FormLabel>
                  <Input
                    name="location.ward"
                    value={form.location.ward}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Địa chỉ chi tiết</FormLabel>
                  <Input
                    name="location.detail"
                    value={form.location.detail}
                    onChange={handleChange}
                  />
                </FormControl>
              </HStack>

              {/* SỬ DỤNG COMPONENT MAPBOXMAP */}
              <FormControl isRequired>
                <FormLabel>
                  Ghim vị trí trên bản đồ{" "}
                  <Text as="span" color="red.500" fontSize="sm">
                    (Bắt buộc)
                  </Text>
                </FormLabel>

                {/* Render Map khi modal mở */}
                {isOpen && (
                  <MapboxMap
                    mode="picker"
                    initialCoords={getInitialCoords()}
                    onLocationSelect={handleLocationSelect}
                    height="350px"
                  />
                )}

                <Text fontSize="xs" mt={2} color="blue.600">
                  {form.location.latitude
                    ? `Đã chọn: ${parseFloat(form.location.latitude).toFixed(
                        5
                      )}, ${parseFloat(form.location.longitude).toFixed(5)}`
                    : "Vui lòng chọn vị trí trên bản đồ"}
                </Text>
              </FormControl>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={submitting}
            mr={3}
          >
            {isEdit ? "Cập nhật" : "Đăng tin"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateListingModal;
