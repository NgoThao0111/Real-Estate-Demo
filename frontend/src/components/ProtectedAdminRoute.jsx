import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { Spinner, Center, Box } from "@chakra-ui/react";
import { useUserStore } from "../store/user.js"; // Import thêm store để check loading chi tiết

export default function ProtectedAdminRoute({ children }) {
  const { currentUser } = useAuthContext();
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth); // Lấy trạng thái loading từ store
  const location = useLocation();

  // 1. NẾU ĐANG KIỂM TRA AUTH -> HIỆN SPINNER
  // Đừng redirect vội, hãy chờ server trả lời xem token có hợp lệ không đã
  if (isCheckingAuth) {
    return (
      <Center h="100vh" bg="gray.100">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  }

  // 2. KIỂM TRA QUYỀN (Sau khi đã loading xong)
  if (!currentUser || currentUser.role !== "admin") {
    // Redirect về Home, nhưng thêm replace để không lưu lịch sử
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
