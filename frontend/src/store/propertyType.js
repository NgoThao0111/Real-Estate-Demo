import { create } from 'zustand';
import axios from "axios";

axios.defaults.withCredentials = true;

export const usePropertyTypeStore = create((set, get) => ({
    propertyTypes: [],
    loading: false,
    error: null,

    fetchPropertyTypes: async () => {
        set({
            loading: true,
            error: null
        });

        try {
            const res = await axios.get('/api/property_type/getPropertyType');

            set({
                propertyTypes: res.data.propertyTypes,
                loading: false,
                error: null     
            });

            return {
                success: true,
                message: "Lấy dữ liệu loại tài sản thành công"
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Không thể kết nối đến máy chủ API"

            set({
                loading: false,
                error: errorMessage,
                propertyTypes: []
            });

            console.error("Lỗi khi fetch property types: ", error);

            return {
                success: false,
                message: errorMessage
            };
        }
    },

    createPropertyType: async (typeData) => {
        set({
            loading: true,
            error: null
        });

        try {
            const res = await axios.post('/api/property_type/createPropertyType', typeData);

            get().fetchPropertyTypes();

            set({
                loading: false
            });

            return {
                success: true,
                message: "Tạo loại tài sản thành công"
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                loading: false,
                error: errorMessage   
            });
            return {
                success: false,
                message: errorMessage
            };
        }
    },
    getPropertyTypeById: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/api/property_type/${id}`);
      set({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  }

}))