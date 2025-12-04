import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true; // Cho phép gửi cookie session

export const useUserStore = create((set) => ({
  user: null,
  savedListings: [],
  loading: false,
  isCheckingSession: false,
  error: null,
  registerUser: async (userData) => {
    try {
      if (
        !userData.username ||
        !userData.password ||
        !userData.name ||
        !userData.phone
      ) {
        throw new Error("Vui lòng điền tất cả các trường bắt buộc.");
      }
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Mật khẩu và xác nhận mật khẩu không khớp.");
      }
      set({ loading: true, error: null });
      const res = await axios.post("/api/users/register", userData);
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

  //Login
  loginUser: async (loginData) => {
    try {
      if (!loginData.username || !loginData.password) {
        throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");
      }

      set({ loading: true, error: null });
      const res = await axios.post("/api/users/login", loginData, {
        withCredentials: true,
      });

      set({
        user: res.data.user,
        loading: false,
        error: null,
      });
      return {
        success: true,
        message: "Đăng nhập thành công",
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({
        loading: false,
        error: errorMessage,
        user: null,
      });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  //Check session nếu reload lại trang
  checkSession: async () => {
    set({ isCheckingSession: true });
    try {
      const res = await axios.get("/api/users/session", {
        withCredentials: true,
      });

      set({
        user: res.data.user || null,
      });
      // nếu đã đăng nhập, tải danh sách tin đăng đã lưu
      if (res.data.user) {
        try {
          const savedRes = await axios.get("/api/users/saved");
          const saved = savedRes.data.listings || [];
          set({ savedListings: saved.map((l) => l._id) });
        } catch (error) {
          console.log("Lỗi tải tin đã lưu", error);
        }
      }
    } catch (error) {
      set({ user: null });
    } finally {
      set({ isCheckingSession: false });
    }
  },

  //Logout
  logoutUser: async () => {
    await axios.post("/api/users/logout", {}, { withCredentials: true });
    set({
      user: null,
      error: null,
      savedListings: [],
    });
  },

  // Lấy danh sách ID tin đăng đã lưu cho người dùng hiện tại
  fetchSavedListings: async () => {
    try {
      const res = await axios.get("/api/users/saved");
      const saved = res.data.listings || [];
      set({ savedListings: saved.map((l) => l._id) });
      return { success: true, data: saved };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },

  // Bật/tắt lưu tin đăng thông qua API và cập nhật danh sách
  toggleSaveListing: async (listingId) => {
    try {
      const res = await axios.post(`/api/users/save/${listingId}`);
      // cập nhật danh sách ID đã lưu
      await (async () => {
        try {
          const r = await axios.get("/api/users/saved");
          const saved = r.data.listings || [];
          set({ savedListings: saved.map((l) => l._id) });
        } catch (e) {}
      })();
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },
}));
