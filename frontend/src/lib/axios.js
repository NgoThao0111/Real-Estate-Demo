import axios from "axios";

const api = axios.create({
  // Vì đã có proxy trong vite.config.js, ta chỉ cần để baseURL là "/api"
  // Khi bạn gọi api.get("/users"), nó sẽ thành http://localhost:5173/api/users
  // Và Vite sẽ chuyển tiếp sang http://localhost:5000/api/users
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",

  // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT
  // Nếu thiếu dòng này, Session Cookie sẽ không được gửi đi
  // => F5 trang web sẽ bị mất đăng nhập ngay lập tức.
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    // Nếu API trả về thành công (status 2xx), cứ cho qua
    return response;
  },
  (error) => {
    // Nếu có lỗi xảy ra
    const originalRequest = error.config;

    // KỊCH BẢN: Nếu lỗi là 401 (Unauthorized) -> Session hết hạn
    // Và đảm bảo không lặp vô hạn (chỉ retry 1 lần nếu cần, hoặc chặn luôn)
    if (error.response && error.response.status === 401) {
      // 1. Hiện thông báo cho người dùng
      if (!toast.isActive("session-expired")) {
        // Tránh hiện 1 lúc nhiều thông báo
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

      if (error.response && error.response.status === 401) {
        // 1. DỌN DẸP LOCAL STORAGE (Giữ lại mode)
        Object.keys(localStorage).forEach((key) => {
          if (key !== "chakra-ui-color-mode") {
            localStorage.removeItem(key);
          }
        });

        setTimeout(() => {
          window.location.href = "/login"; // Chuyển trang và reload sạch sẽ
        }, 1500);

        return Promise.reject(error);
      }

      // Các lỗi khác (500, 404...) thì trả về để Component tự xử lý
      return Promise.reject(error);
    }
  }
);
export default api;
