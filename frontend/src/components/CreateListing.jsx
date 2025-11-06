import {
    Box,
    Container,
    useColorModeValue,
    VStack,
    Heading,
    Input,
    Button,
    Select,
    Grid,
    GridItem,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

const CreateListing = ({ onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        area: "",
        price: "",
        status: "available",
        property_type: "house",
        rental_type: "monthly",
        address: {
            city: "",
            ward: "",
            detail: "",
        },
    });

    const handleChange = (path, value) => {
        if (path.startsWith("address.")) {
            const key = path.split(".")[1];
            setForm((s) => ({ ...s, address: { ...s.address, [key]: value } }));
        } else {
            setForm((s) => ({ ...s, [path]: value }));
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            area: "",
            price: "",
            status: "available",
            property_type: "house",
            rental_type: "monthly",
            address: { city: "", ward: "", detail: "" },
        });
    };

    const handleCreateListing = async () => {
        // basic client-side validation
        if (!form.title || !form.area || !form.price || !form.status || !form.property_type || !form.rental_type || !form.address.city || !form.address.ward || !form.address.detail) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ", status: "warning", duration: 3000, isClosable: true });
            return;
        }

        const payload = {
            title: form.title,
            description: form.description,
            area: Number(form.area),
            price: Number(form.price),
            status: form.status,
            property_type: form.property_type,
            rental_type: form.rental_type,
            address: {
                city: form.address.city,
                ward: form.address.ward,
                detail: form.address.detail,
            },
        };

        try {
            setLoading(true);
            // backend routes are mounted at /api/listings
            const res = await axios.post("/api/listings/createList", payload);
            toast({ title: "Thành công", description: res.data?.message || "Tạo bài đăng thành công", status: "success", duration: 3000, isClosable: true });
            // call parent callback (e.g., to close modal)
            if (typeof onSuccess === "function") onSuccess(res.data);
            resetForm();
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Lỗi server";
            toast({ title: "Lỗi", description: message, status: "error", duration: 4000, isClosable: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.sm">
            <VStack spacing={4}>
                <Heading as="h1" size="2xl" textAlign="center" mb={8}>
                    Tạo bài đăng mới
                </Heading>

                <Box w="full" bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"}>
                    <VStack spacing={4}>
                        <Input placeholder="Tiêu đề" name="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
                        <Input placeholder="Mô tả" name="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />

                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3} w="full">
                            <GridItem>
                                <Input placeholder="Diện tích (m2)" name="area" value={form.area} onChange={(e) => handleChange("area", e.target.value)} />
                            </GridItem>
                            <GridItem>
                                <Input placeholder="Giá (VNĐ)" name="price" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
                            </GridItem>
                        </Grid>

                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3} w="full">
                            <GridItem>
                                <Select value={form.property_type} onChange={(e) => handleChange("property_type", e.target.value)}>
                                    <option value="house">Nhà</option>
                                    <option value="apartment">Căn hộ</option>
                                    <option value="land">Đất</option>
                                </Select>
                            </GridItem>
                            <GridItem>
                                <Select value={form.rental_type} onChange={(e) => handleChange("rental_type", e.target.value)}>
                                    <option value="monthly">Thuê theo tháng</option>
                                    <option value="yearly">Thuê theo năm</option>
                                    <option value="sale">Bán</option>
                                </Select>
                            </GridItem>
                        </Grid>

                        <Select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                            <option value="available">Đang rao</option>
                            <option value="sold">Đã bán/Cho thuê</option>
                        </Select>

                        <Input placeholder="Thành phố" value={form.address.city} onChange={(e) => handleChange("address.city", e.target.value)} />
                        <Input placeholder="Phường/Xã" value={form.address.ward} onChange={(e) => handleChange("address.ward", e.target.value)} />
                        <Input placeholder="Chi tiết địa chỉ" value={form.address.detail} onChange={(e) => handleChange("address.detail", e.target.value)} />

                        <Button colorScheme="blue" onClick={handleCreateListing} w="full" isLoading={loading} loadingText="Đang tạo">
                            Tạo bài đăng
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default CreateListing;