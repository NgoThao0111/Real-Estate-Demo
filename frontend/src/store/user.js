import { create } from "zustand";
import api from "../lib/axios.js"; 

export const useUserStore = create((set) => ({
  user: null,
  // --- THÊM: Khởi tạo token từ LocalStorage để khi F5 không bị mất kết nối Socket ---
  accessToken: localStorage.getItem("accessToken") || null, 
  savedListings: [],
  loading: false,
  isCheckingAuth: false,
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
      
      const res = await api.post("/users/register", userData);

      // Trường hợp cần xác thực email
      if (res.data.verificationRequired) {
        set({ loading: false, error: null });
        return { success: true, verificationRequired: true, message: res.data.message, user: res.data.user };
      }

      // Trường hợp đăng ký xong tự login luôn (nếu backend cấu hình vậy)
      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken); // Lưu LocalStorage
        set({ 
            user: res.data.user, 
            accessToken: res.data.accessToken, // Lưu State
            loading: false, 
            error: null 
        });
        return { success: true, message: "Đăng ký thành công!", user: res.data.user };
      }

      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ loading: false, error: errorMessage, user: null });
      return { success: false, message: errorMessage };
    }
  },

  resendVerification: async (email) => {
    try {
      const res = await api.post('/users/resend-verification', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },

  verifyEmail: async (email, code) => {
    try {
      const res = await api.post('/users/verify-email', { email, code });
      
      // --- SỬA: Lưu token khi xác thực thành công ---
      if (res.data.accessToken) {
         localStorage.setItem("accessToken", res.data.accessToken);
         set({ user: res.data.user, accessToken: res.data.accessToken });
      } else if (res.data.user) {
         set({ user: res.data.user });
      }
      
      return { success: true, message: res.data.message, user: res.data.user };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },

  sendResetCode: async (email) => {
    try {
      const res = await api.post('/users/forgot-password-code', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },

  resetPasswordWithCode: async (email, code, password) => {
    try {
      const res = await api.post('/users/reset-password-code', { email, code, password });
      
      // --- SỬA: Lưu token sau khi reset pass (Auto login) ---
      if (res.data.accessToken) {
         localStorage.setItem("accessToken", res.data.accessToken);
         set({ accessToken: res.data.accessToken });
         // Nếu backend trả về user info nữa thì set luôn user
      }

      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
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

      // --- QUAN TRỌNG: Lưu Access Token ---
      const { user, accessToken } = res.data;
      localStorage.setItem("accessToken", accessToken);

      set({
        user: user,
        accessToken: accessToken, // Cập nhật state
        loading: false,
        error: null,
      });
      
      return { success: true, message: "Đăng nhập thành công", user: user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({
        loading: false,
        error: errorMessage,
        user: null,
        accessToken: null
      });
      return { success: false, message: errorMessage };
    }
  },

  requestLoginGoogle: async (tokenGoogle) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/users/login-google', { tokenGoogle: tokenGoogle });
      
      // --- QUAN TRỌNG: Lưu Access Token ---
      const { user, accessToken } = res.data;
      localStorage.setItem("accessToken", accessToken);

      set({
        user: user,
        accessToken: accessToken,
        loading: false,
        error: null,
      });

      return { success: true, message: "Đăng nhập thành công", user: user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({
        loading: false,
        error: errorMessage,
        user: null,
        accessToken: null
      });
      return { success: false, message: errorMessage };
    }
  },

  // --- 3. CHECK AUTH ---
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // 1. Gọi endpoint check cookie
      const res = await api.get("/check-auth");
      const userData = res.data.user || null;

      // 2. Logic đồng bộ Token:
      // Endpoint /check-auth hiện tại chỉ trả về User, không trả AccessToken (theo code server.js cũ).
      // Nhưng nếu User tồn tại (Cookie Refresh Token hợp lệ), mà LocalStorage mất AccessToken (do xóa cache),
      // thì ta cần gọi Refresh Token để lấy lại Access Token mới.
      
      if (userData) {
          set({ user: userData });
          
          // Nếu trong state/storage chưa có accessToken (hoặc bị mất), gọi refresh
          if (!localStorage.getItem("accessToken")) {
             try {
                 const refreshRes = await api.post("/users/refresh-token");
                 if(refreshRes.data.accessToken) {
                     localStorage.setItem("accessToken", refreshRes.data.accessToken);
                     set({ accessToken: refreshRes.data.accessToken });
                 }
             } catch (e) {
                 console.log("Auto refresh failed", e);
             }
          }

          // Tải danh sách đã lưu
          try {
            const savedRes = await api.get("/users/saved");
            const saved = savedRes.data.listings || [];
            set({ savedListings: saved.map((l) => l._id) });
          } catch (error) {
            console.log("Lỗi tải tin đã lưu", error);
          }
      } else {
          // Nếu check-auth trả về user null -> Token hết hạn -> Logout
          set({ user: null, accessToken: null, savedListings: [] });
          localStorage.removeItem("accessToken");
      }
    } catch (error) {
      set({ user: null, accessToken: null, savedListings: [] });
      localStorage.removeItem("accessToken");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- 4. LOGOUT ---
  logoutUser: async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.log("Lỗi logout server:", error);
    } finally {
      // Xóa State
      set({ user: null, accessToken: null, savedListings: [] });

      // Xóa Token trong Storage
      localStorage.removeItem("accessToken");

      // Dọn các key khác (giữ lại theme)
      Object.keys(localStorage).forEach((key) => {
        if (key !== "chakra-ui-color-mode") {
          localStorage.removeItem(key);
        }
      });

      window.location.href = "/";
    }
  },

  // --- 5. Helper Action để cập nhật token (Dùng cho Axios Interceptor) ---
  // Hàm này sẽ được Axios gọi khi nó tự động refresh token thành công
  setAccessToken: (token) => {
      localStorage.setItem("accessToken", token);
      set({ accessToken: token });
  },

  // ... (Phần fetchSavedListings và toggleSaveListing GIỮ NGUYÊN) ...
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
      const res = await api.post(`/users/save/${listingId}`);
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
      return { success: false, message };
    }
  },
}));