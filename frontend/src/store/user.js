import {create} from 'zustand';
import axios from "axios";

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
}));