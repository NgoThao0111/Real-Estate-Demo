import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react";

// Tạo instance toast độc lập để dùng được bên ngoài Component React
const { toast } = createStandaloneToast();

const api = axios.create({
  // URL Backend (Lấy từ biến môi trường hoặc mặc định localhost)
  baseURL: import.meta.env.MODE === "development"
    ? (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")
    : "/api",
  //baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",

  // Quan trọng: Cho phép gửi/nhận Cookie (JWT/Session) giữa client và server
  withCredentials: true,
});

// --- INTERCEPTOR PHẢN HỒI ---
api.interceptors.response.use(
  (response) => {
    // Nếu API trả về thành công (2xx), trả về dữ liệu bình thường
    return response;
  },
  (error) => {
    // Nếu có lỗi xảy ra từ phía Server
    if (error.response && error.response.status === 401) {
      // 2. Dọn dẹp LocalStorage (Xóa user cũ, giữ lại theme Dark/Light)
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

      // Hiển thị toast chỉ một lần
      if (!toast.isActive("session-expired")) {
        toast({
          id: "session-expired",
          title: "Phiên đăng nhập hết hạn",
          description: "Vui lòng đăng nhập lại để tiếp tục.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }

      // Đặt cờ cho AuthContext để xử lý chuyển hướng (tránh nhiều lần chuyển hướng)
      localStorage.setItem("triggerLoginModal", "true");
      
      // Phát sự kiện cho các listener (tùy chọn, nếu bạn sử dụng nó)
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    // Trả lỗi về (reject) để các hàm gọi API ở component biết mà tắt Loading (Spinner)
    return Promise.reject(error);
  }
);

export default api;
