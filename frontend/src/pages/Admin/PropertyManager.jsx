import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  HStack,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useColorModeValue,
  Image,
  Badge,
} from "@chakra-ui/react";
import { useRef } from "react";
import adminService from "../../services/adminService";

export default function PropertyManager() {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [pending, setPending] = useState({ id: null, action: null });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getListings({ status: statusFilter, rental_type: typeFilter });
      const items = res.data.listings || [];
      console.log(
        "Admin listings statuses:",
        items.map((i) => ({ id: i._id, status: i.status }))
      ); // debug
      setListings(items);
    } catch (e) {
      console.error("Failed to fetch admin listings", e);
    } finally {
      setLoading(false);
    }
  };
      Image,
      Badge,

  useEffect(() => {
    fetchListings();
  }, []);

  const confirmAction = (id, action) => {
    setPending({ id, action });
    onOpen();
  };

  const performAction = async () => {
    const { id, action } = pending;
    try {
      if (action === 'approve' || action === 'reject') {
        const status = action === 'approve' ? 'approved' : 'rejected';
        await adminService.updateListingStatus(id, status);
        setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
      }

      if (action === 'delete') {
        await adminService.deleteListing(id);
        setListings((prev) => prev.filter((l) => l._id !== id));
      }

      toast({ status: 'success', title: 'Thành công' });
    } catch (e) {
      console.error('Admin action failed', e);
      toast({ status: 'error', title: 'Thao tác thất bại' });
    } finally {
      setPending({ id: null, action: null });
      onClose();
    }
  };

  // Color-mode aware tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  const normalize = (s) => (s || "").toString().toLowerCase().trim();

  const mapStatus = (s) => {
    const st = normalize(s);
    if (st === "approved" || st === "available" || st === "published")
      return "Đã duyệt";
    if (st === "pending" || st === "waiting") return "Chờ duyệt";
    if (st === "rejected" || st === "denied") return "Bị từ chối";
    return s;
  };

  const mapType = (t) => {
    if (!t) return "";
    const tt = t.toString().toLowerCase();
    if (tt === "rent") return "Cho thuê";
    if (tt === "sale" || tt === "sell") return "Bán";
    return t;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Liên hệ";
    const amount = Number(price);
    if (isNaN(amount)) return price;
    if (amount >= 1000000000) {
      // show billions with comma as decimal separator
      return (amount / 1000000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' Tỷ';
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getConfirmMessage = (action) => {
    if (action === "approve") return "Bạn có chắc muốn duyệt bài này?";
    if (action === "reject") return "Bạn có chắc muốn từ chối bài này?";
    if (action === "delete") return "Bạn có chắc muốn xóa bài này?";
    return "Bạn có chắc muốn thực hiện hành động này?";
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Quản lý tin đăng</Heading>

      <HStack spacing={3} mb={3}>
        <Select placeholder="Tất cả trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} maxW="220px">
          <option value="">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Bị từ chối</option>
        </Select>

        <Select placeholder="Tất cả loại" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} maxW="220px">
          <option value="">Tất cả</option>
          <option value="rent">Cho thuê</option>
          <option value="sale">Bán</option>
        </Select>

        <Button onClick={fetchListings} colorScheme="blue">Áp dụng</Button>
        <Button onClick={() => { setStatusFilter(''); setTypeFilter(''); fetchListings(); }}>Đặt lại</Button>
      </HStack>

      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <Box bg={cardBg} borderRadius="md" p={4} overflowX="auto">
          <Table variant="simple" color={textColor}>
            <Thead>
              <Tr>
                <Th>Ảnh</Th>
                <Th>Tiêu đề</Th>
                <Th>Giá</Th>
                <Th>Diện tích</Th>
                <Th>Loại</Th>
                <Th>Tỉnh/Thành</Th>
                <Th>Trạng thái</Th>
                <Th>Người đăng</Th>
                <Th>Hành động</Th>
              </Tr>
            </Thead>
            <Tbody>
              {listings.map((l) => (
                <Tr key={l._id}>
                  <Td>
                      {l.images && l.images.length ? (
                        <Image boxSize="60px" objectFit="cover" src={typeof l.images[0] === 'string' ? l.images[0] : l.images[0].url} alt={l.title} borderRadius="md" />
                      ) : (
                        <Box w="60px" h="40px" bg="gray.100" borderRadius="6px" />
                      )}
                  </Td>
                  <Td>
                    <Text fontWeight={600}>{l.title}</Text>
                  </Td>
                  <Td>{formatPrice(l.price)}</Td>
                  <Td>{l.area}</Td>
                  <Td>{mapType(l.rental_type)}</Td>
                  <Td>{l.location?.province}</Td>
                  <Td>
                      {normalize(l.status) === 'approved' ? (
                        <Badge colorScheme="green">Đã duyệt</Badge>
                      ) : normalize(l.status) === 'pending' ? (
                        <Badge colorScheme="orange">Chờ duyệt</Badge>
                      ) : normalize(l.status) === 'rejected' ? (
                        <Badge colorScheme="red">Bị từ chối</Badge>
                      ) : (
                        <Badge>{mapStatus(l.status)}</Badge>
                      )}
                  </Td>
                  <Td>{l.owner?.email ? `${l.owner?.name || l.owner?.username} (${l.owner?.email})` : (l.owner?.name || l.owner?.username)}</Td>
                  <Td>
                    <HStack>
                      <Button size="sm" as="a" href={`/listings/${l._id}`} target="_blank">Xem trước</Button>
                      {normalize(l.status) === 'approved' ? (
                        <Button size="sm" colorScheme="red" variant="outline" onClick={() => confirmAction(l._id, 'delete')}>Xóa</Button>
                      ) : normalize(l.status) === 'rejected' ? (
                        <>
                          <Button size="sm" colorScheme="green" onClick={() => confirmAction(l._id, 'approve')}>Duyệt</Button>
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => confirmAction(l._id, 'delete')}>Xóa</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" colorScheme="green" onClick={() => confirmAction(l._id, 'approve')}>Duyệt</Button>
                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => confirmAction(l._id, 'reject')}>Từ chối</Button>
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => confirmAction(l._id, 'delete')}>Xóa</Button>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Xác nhận
                </AlertDialogHeader>
                <AlertDialogBody>
                  {getConfirmMessage(pending.action)}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    Hủy
                  </Button>
                  <Button colorScheme="red" ml={3} onClick={performAction}>
                    {pending.action === "delete" ? "Xóa" : "Xác nhận"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </Box>
      )}
    </Box>
  );
}
