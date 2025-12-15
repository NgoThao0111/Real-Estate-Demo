import { useEffect, useState, useRef } from "react";
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
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  HStack,
  useColorModeValue
} from "@chakra-ui/react";
import adminService from "../../services/adminService";

export default function ReportsManager() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [pending, setPending] = useState({ id: null, action: null });

  const mapStatus = (s) => {
    if (!s) return "";
    const st = s.toString().toLowerCase();
    if (st === "pending") return "Chờ duyệt";
    if (st === "reviewed") return "Đã xem";
    if (st === "resolved") return "Đã giải quyết";
    return s;
  };

  const fetchReports = async (p = 1) => {
    try {
      const res = await adminService.getReports(p);
      setReports(res.data.reports || []);
      setPage(res.data.page || p);
      setPages(res.data.pages || 1);
    } catch (e) {
      toast({ status: "error", title: "Không thể tải báo cáo" });
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    fetchReports(page);
  }, []);

  const confirmAction = (id, action) => {
    setPending({ id, action });
    onOpen();
  };

  const getConfirmMessage = (action, r) => {
    if (action === "resolve")
      return "Bạn có chắc muốn đánh dấu báo cáo này là đã giải quyết?";
    if (action === "delete")
      return r?.listing
        ? "Bạn có chắc muốn xóa tin này?"
        : "Bài viết gốc đã bị xóa. Bạn muốn đánh dấu báo cáo là đã giải quyết?";
    if (action === "ban")
      return r?.listing
        ? "Bạn có chắc muốn cấm người đăng này?"
        : "Bài viết gốc đã bị xóa. Bạn có chắc muốn cấm người này?";
    return "Bạn có chắc muốn thực hiện hành động này?";
  };

  const perform = async () => {
    try {
      const { id, action } = pending;
      let res;
      if (action === "resolve") {
        res = await adminService.resolveReport(id, "resolved");
      } else if (action === "delete") {
        res = await adminService.actionOnReport(id, "delete_listing");
      } else if (action === "ban") {
        res = await adminService.actionOnReport(id, "ban_user");
      }
      toast({ status: "success", title: res?.data?.message || "Thành công" });
      fetchReports(page);
    } catch (e) {
      toast({
        status: "error",
        title: e?.response?.data?.message || "Thất bại",
      });
    } finally {
      onClose();
      setPending({ id: null, action: null });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Báo cáo
      </Heading>
      <Box bg={cardBg} p={4} borderRadius="md">
        <Table variant="simple" color={textColor}>
          <Thead>
            <Tr>
              <Th>Tin</Th>
              <Th>Người báo</Th>
              <Th>Lý do</Th>
              <Th>Ngày</Th>
              <Th>Trạng thái</Th>
              <Th>Hành động</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reports.map((r) => (
              <Tr key={r._id}>
                <Td>
                  {r.listing?.title || (
                    <Text color={mutedColor}>(Bài viết đã xóa)</Text>
                  )}
                </Td>
                <Td>{r.reporter?.username || r.reporter?.name || "—"}</Td>
                <Td>
                  {r.reason}
                  {r.detail ? (
                    <Text
                      fontSize="xs"
                      color="gray.600"
                    >{` — ${r.detail}`}</Text>
                  ) : null}
                </Td>
                <Td>{new Date(r.createdAt).toLocaleString()}</Td>
                <Td>{mapStatus(r.status)}</Td>
                <Td>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      mr={2}
                      onClick={() => confirmAction(r._id, "resolve")}
                    >
                      Giải quyết
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      mr={2}
                      onClick={() => confirmAction(r._id, "delete")}
                      isDisabled={!r.listing}
                    >
                      Xóa tin
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => confirmAction(r._id, "ban")}
                      isDisabled={!r.listing}
                    >
                      Cấm người đăng
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Box
          mt={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text>
            Trang {page} / {pages} — Tổng {reports.length}
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => {
                if (page > 1) {
                  fetchReports(page - 1);
                }
              }}
              isDisabled={page <= 1}
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (page < pages) {
                  fetchReports(page + 1);
                }
              }}
              isDisabled={page >= pages}
            >
              Trang sau
            </Button>
          </HStack>
        </Box>

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
                {getConfirmMessage(
                  pending.action,
                  reports.find((r) => r._id === pending.id)
                )}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Hủy
                </Button>
                <Button colorScheme="red" ml={3} onClick={perform}>
                  Xác nhận
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
}
