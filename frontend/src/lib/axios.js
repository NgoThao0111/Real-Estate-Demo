import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react";

// Tạo instance toast độc lập để dùng được bên ngoài Component React
const { toast } = createStandaloneToast();

const api = axios.create({
  // URL Backend (Lấy từ biến môi trường hoặc mặc định localhost)
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api",

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
    const status = error.response?.status;

    // Chỉ tự động xử lý phiên khi server trả 401 (chưa đăng nhập) hoặc 403 (không có quyền)
    if (status === 401 || status === 403) {
      // 2. Dọn dẹp LocalStorage (Xóa user cũ, giữ lại theme Dark/Light)
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

      if (!toast.isActive("session-expired")) {
        toast({
          id: "session-expired",
          title: status === 401 ? "Phiên đăng nhập hết hạn" : "Không có quyền",
          description: status === 401 ? "Vui lòng đăng nhập lại để tiếp tục." : "Bạn không có quyền thực hiện hành động này.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }

      localStorage.setItem("triggerLoginModal", "true");
      window.location.href = "/";
      // 3. Chuyển hướng về Login sau 1.5s (để người dùng kịp đọc thông báo)
      setTimeout(() => {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }, 2000);

      return Promise.reject(error);
    }

    // Các lỗi khác (4xx/5xx) không nên ép logout tự động, trả về để component xử lý
    return Promise.reject(error);
  }
);

export default api;
