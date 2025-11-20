import axios from "axios";

const api = axios.create({
  // Vì đã có proxy trong vite.config.js, ta chỉ cần để baseURL là "/api"
  // Khi bạn gọi api.get("/users"), nó sẽ thành http://localhost:5173/api/users
  // Và Vite sẽ chuyển tiếp sang http://localhost:5000/api/users
  baseURL: "/api", 

  // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT
  // Nếu thiếu dòng này, Session Cookie sẽ không được gửi đi
  // => F5 trang web sẽ bị mất đăng nhập ngay lập tức.
  withCredentials: true, 
});

export default api;