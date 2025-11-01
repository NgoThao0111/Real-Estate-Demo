import {create} from 'zustand';
import axios from "axios";

axios.defaults.withCredentials = true; // Cho phép gửi cookie session

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    error: null,
    registerUser: async (userData) => {
        try {
            if (!userData.username || !userData.password || !userData.name || !userData.phone) {
                throw new Error("Vui lòng điền tất cả các trường bắt buộc.");
            }
            if (userData.password !== userData.confirmPassword) {
                throw new Error("Mật khẩu và xác nhận mật khẩu không khớp.");
            }
            set({ loading: true, error: null });
            const res = await axios.post('/api/users/register', userData);
            set({ 
                user: res.data.user, 
                loading: false,
                error: null
            });
            return { success: true, message: "Đăng ký thành công!" };
        }
        catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ loading: false, error: errorMessage, user: null });
            return { success: false, message: errorMessage };
        }
    },

    //Login
    loginUser: async (loginData) => {
        try {
            if(!loginData.username || !loginData.password) {
                throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");
            }

            set({loading: true, error: null});
            const res = await axios.post("/api/users/login", loginData, { withCredentials: true});

            set({
                user: res.data.user,
                loading: false,
                error: null
            });
            return {
                success: true,
                message: "Đăng nhập thành công"
            };

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                loading: false,
                error: errorMessage,
                user: null
            });
            return {
                success: false,
                message: errorMessage
            };
        }
    },

    //Check session nếu reload lại trang
    checkSession: async () => {
        try {
            const res = await axios.get("/api/users/session", {withCredentials: true});

            set({
                user: res.data.user || null
            });
        } catch (error) {
            set({user: null});
        }
    },

    //Logout
    logoutUser: async () => {
        await axios.post("/api/users/logout", {}, {withCredentials: true});
        set({
            user: null,
            error: null
        });
    },
}));