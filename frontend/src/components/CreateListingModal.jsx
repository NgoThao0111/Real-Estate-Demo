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
  Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useListStore } from "../store/list.js";
import { usePropertyTypeStore } from "../store/propertyType.js";

const CreateListingModal = ({ isOpen, onClose, defaultValues = {} }) => {
  const toast = useToast();
  const createListing = useListStore((s) => s.createListing);

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
    images: "",
    location: {
      province: "",
      ward: "",
      detail: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  //Merge defaultValues an toàn
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        ...defaultValues,
        location: {
          ...prev.location,
          ...(defaultValues.location || {}),
        },
      }));
    }
  }, [isOpen, defaultValues]);

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
      images: form.images
        ? form.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      location: {
        province: form.location.province,
        ward: form.location.ward,
        detail: form.location.detail,
      },
    };

    try {
      setSubmitting(true);

      const res = await createListing(payload);

      if (res.success) {
        toast({
          title: "Thành công",
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
          images: "",
          location: { province: "", ward: "", detail: "" },
        });
      } else {
        toast({
          title: "Lỗi",
          description: res.message || "Tạo bài đăng thất bại.",
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Tạo bài đăng thất bại.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Tạo bài đăng mới</ModalHeader>
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
                <Input name="price" value={form.price} onChange={handleChange} />
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
              <FormLabel>Ảnh (URLs, cách nhau bằng dấu phẩy)</FormLabel>
              <Input
                placeholder="https://..., https://..."
                name="images"
                value={form.images}
                onChange={handleChange}
              />
            </FormControl>

            {/* Địa chỉ */}
            <FormControl isRequired>
              <FormLabel>Thành phố</FormLabel>
              <Input
                name="location.province"
                value={form.location.province}
                onChange={handleChange}
              />
            </FormControl>

            <HStack>
              <FormControl>
                <FormLabel>Phường</FormLabel>
                <Input
                  name="location.ward"
                  value={form.location.ward}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Địa chỉ chi tiết</FormLabel>
                <Input
                  name="location.detail"
                  value={form.location.detail}
                  onChange={handleChange}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button type="submit" colorScheme="blue" isLoading={submitting} mr={3}>
            Tạo
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
