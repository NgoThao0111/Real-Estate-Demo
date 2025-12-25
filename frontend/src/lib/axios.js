import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? "https://real-estate-demo-backend-latest.onrender.com/api"
      : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (config) => {
    return config;
  },
  (response) => response,
  (error) => {
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
          description:
            status === 401
              ? "Vui lòng đăng nhập lại để tiếp tục."
              : "Bạn không có quyền thực hiện hành động này.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }

      localStorage.setItem("triggerLoginModal", "true");
      // 3. Chuyển hướng về Login sau 1.5s (để người dùng kịp đọc thông báo)
      setTimeout(() => {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }, 2000);
    }

    // Các lỗi khác (4xx/5xx) không nên ép logout tự động, trả về để component xử lý
    return Promise.reject(error);
  }
);

export default api;
