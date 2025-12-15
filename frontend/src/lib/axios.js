import axios from "axios";
import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

const api = axios.create({
  baseURL: "https://real-estate-demo-m86e.onrender.com/api",
  withCredentials: true,
});

// Flag để tránh bắn 401 nhiều lần
let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (config) => {
  console.log("➡️ API CALL:", config.url);
  return config;
},
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      // Giữ lại theme, xóa phần còn lại
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

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

      // Báo cho App xử lý logout + redirect
      window.dispatchEvent(new Event("auth:unauthorized"));

      // Sau 3s cho phép xử lý lại nếu cần
      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 3000);
    }

    return Promise.reject(error);
  }
);

export default api;
