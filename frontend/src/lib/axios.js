import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react"; // 1. Import cái này

// 2. Tạo instance toast độc lập để dùng ngoài component React
const { toast } = createStandaloneToast();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Quan trọng: Gửi cookie session
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu lỗi là 401 (Hết phiên đăng nhập / Chưa đăng nhập)
    if (error.response && error.response.status === 401) {
      
      // 1. Hiện thông báo (Kiểm tra isActive để tránh spam toast nếu gọi nhiều API cùng lúc)
      if (!toast.isActive("session-expired")) {
        toast({
          id: "session-expired", // ID định danh để không hiện trùng
          title: "Phiên đăng nhập hết hạn",
          description: "Vui lòng đăng nhập lại để tiếp tục.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }

      // 2. Dọn dẹp LocalStorage (Giữ lại theme)
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

      // 3. Chuyển hướng sau 1.5s
      setTimeout(() => {
        // Dùng window.location.href để reload lại trang web sạch sẽ
        // Kiểm tra xem có đang ở trang login không để tránh loop vô tận
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
      }, 1500);
    }

    // Luôn trả về reject để component biết mà tắt Loading state
    return Promise.reject(error);
  }
);

export default api;