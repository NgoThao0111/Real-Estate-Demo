import { create } from "zustand";
import api from "../lib/axios.js"; // Import api instance (đã có interceptor & credentials)

export const useUserStore = create((set) => ({
  user: null,
  savedListings: [],
  loading: false,
  isCheckingAuth: false, // Đổi tên cho đúng ý nghĩa JWT
  error: null,

  // --- 1. REGISTER ---
  registerUser: async (userData) => {
    try {
      if (!userData.username || !userData.password || !userData.name || !userData.phone) {
        throw new Error("Vui lòng điền tất cả các trường bắt buộc.");
      }
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Mật khẩu và xác nhận mật khẩu không khớp.");
      }
      
      set({ loading: true, error: null });
      
      // Gọi API đăng ký
      const res = await api.post("/users/register", userData);
      
      // Đăng ký thành công -> Server trả về user info + cookie token
      set({
        user: res.data.user,
        loading: false,
        error: null,
      });
      return { success: true, message: "Đăng ký thành công!" };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ loading: false, error: errorMessage, user: null });
      return { success: false, message: errorMessage };
    }
  },

  // --- 2. LOGIN ---
  loginUser: async (loginData) => {
    try {
      if (!loginData.username || !loginData.password) {
        throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");
      }

      set({ loading: true, error: null });
      
      const res = await api.post("/users/login", loginData);

      // Login thành công -> Lưu user vào state
      set({
        user: res.data.user,
        loading: false,
        error: null,
      });
      
      return { success: true, message: "Đăng nhập thành công" };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({
        loading: false,
        error: errorMessage,
        user: null,
      });
      return { success: false, message: errorMessage };
    }
  },

  requestLoginGoogle: async (tokenGoogle) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/users/login-google', { tokenGoogle: tokenGoogle });
      
      set({
        user: res.data.user,
        loading: false,
        error: null,
      });

      return { success: true, message: "Đăng nhập thành công" };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({
        loading: false,
        error: errorMessage,
        user: null,
      });
      return { success: false, message: errorMessage };
    }
  },

  // --- 3. CHECK AUTH (Thay thế checkSession) ---
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // Gọi endpoint JWT chuẩn ở server.js
      const res = await api.get("/check-auth");

      const userData = res.data.user || null;
      set({ user: userData });

      // Nếu đã đăng nhập, tải danh sách tin đã lưu
      if (userData) {
        try {
          const savedRes = await api.get("/users/saved");
          const saved = savedRes.data.listings || [];
          set({ savedListings: saved.map((l) => l._id) });
        } catch (error) {
          console.log("Lỗi tải tin đã lưu", error);
        }
      }
    } catch (error) {
      // Nếu lỗi 401 hoặc lỗi mạng -> Coi như chưa đăng nhập
      set({ user: null, savedListings: [] });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- 4. LOGOUT ---
  logoutUser: async () => {
    try {
      // Gọi API để xóa cookie token
      await api.post("/users/logout");
    } catch (error) {
      console.log("Lỗi logout server:", error);
    } finally {
      // Xóa state
      set({ user: null, savedListings: [] });

      // Dọn Local Storage
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

      // Chuyển hướng về trang chủ
      window.location.href = "/";
    }
  },

  // --- 5. SAVED LISTINGS ---
  fetchSavedListings: async () => {
    try {
      const res = await api.get("/users/saved");
      const saved = res.data.listings || [];
      set({ savedListings: saved.map((l) => l._id) });
      return { success: true, data: saved };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },

  toggleSaveListing: async (listingId) => {
    try {
      // 1. Gọi API toggle
      const res = await api.post(`/users/save/${listingId}`);
      
      // 2. Cập nhật State Optimistic (Để UI phản hồi nhanh)
      set((state) => {
        const isSaved = state.savedListings.includes(listingId);
        if (isSaved) {
            return { savedListings: state.savedListings.filter(id => id !== listingId) };
        } else {
            return { savedListings: [...state.savedListings, listingId] };
        }
      });

      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      // Nếu lỗi, nên fetch lại để đồng bộ state cũ (Revert)
      return { success: false, message };
    }
  },
}));