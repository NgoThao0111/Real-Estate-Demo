import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api",
  withCredentials: true, 
});

// 1. REQUEST: Gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE: Xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      const { status, data } = error.response;

      // --- TRƯỜNG HỢP 1: Token Hết Hạn (403 + message "Token Expired") ---
      // Thử refresh token cứu vãn
      if (status === 403 && data.message === "Token Expired" && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await api.post("/users/refresh-token");
          const newAccessToken = res.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          return handleAuthError(refreshError);
        }
      }

      // --- TRƯỜNG HỢP 2: Lỗi 401 (Token rác/không hợp lệ) hoặc 403 (Cấm) ---
      // SỬA LỖI LOOP: Không reload trang (window.location.href) ở đây nữa!
      if (status === 401 || (status === 403 && data.message !== "Token Expired")) {
         return handleAuthError(error);
      }
    }

    return Promise.reject(error);
  }
);

// Hàm xử lý lỗi Auth nhẹ nhàng hơn (Không reload trang)
const handleAuthError = (error) => {
    // 1. Xóa token rác ngay lập tức để các request sau không bị lỗi nữa
    localStorage.removeItem("accessToken");
    
    // 2. Chỉ hiện thông báo 1 lần
    if (!toast.isActive("auth-error")) {
      const status = error.response?.status;
      toast({
        id: "auth-error",
        title: status === 403 ? "Không đủ quyền truy cập" : "Phiên đăng nhập hết hạn",
        description: "Vui lòng đăng nhập lại.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }

    // 3. Dispatch sự kiện để App.jsx mở Modal đăng nhập
    // QUAN TRỌNG: Không dùng window.location.href = "/" để tránh vòng lặp
    window.dispatchEvent(new Event("auth:unauthorized"));
    
    return Promise.reject(error);
};

export default api;