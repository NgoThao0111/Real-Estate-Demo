import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Lỗi không xác định";

export const useListStore = create((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  fetchListings: async (params = {}, isBackground = false) => {
    try {
      if (!isBackground) set({ loading: true, error: null });

      // Lọc bỏ giá trị rỗng
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== null && v !== "" && v !== undefined
        )
      );

      // QUAN TRỌNG: Luôn dùng endpoint /search và luôn gửi params đi
      // Dù params rỗng thì backend vẫn trả về "Tất cả" bình thường.
      const queryString = new URLSearchParams(cleanParams).toString();
      const endpoint = `/api/listings/search?${queryString}`;

      const res = await axios.get(endpoint);
      const data = res.data.data || res.data.listings || [];

      set({ listings: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  getListingById: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/api/listings/${id}`);
      set({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  fetchMyListings: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/api/listings/my`);
      const data = res.data.listings || [];
      set({ listings: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  fetchSavedListings: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/api/users/saved`);
      const data = res.data.listings || [];
      set({ listings: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  toggleSaveListing: async (listingId) => {
    try {
      // Lưu ý: Hành động này có thể làm Optimistic UI (cập nhật ngay ko chờ server) nếu muốn trải nghiệm tốt hơn nữa
      set({ loading: true, error: null });
      const res = await axios.post(`/api/users/save/${listingId}`);
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  createListing: async (payload) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`/api/listings/createList`, payload);
      const created = res.data.listing || res.data || null;
      if (created) {
        const current = get().listings || [];
        set({ listings: [created, ...current] });
      }
      set({ loading: false });
      return { success: true, data: created };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  updateListing: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put(`/api/listings/${id}`, payload);
      const updated = res.data.listing || res.data || null;
      if (updated) {
        const current = get().listings || [];
        set({
          listings: current.map((l) =>
            l._id === id || l.id === id ? updated : l
          ),
        });
      }
      set({ loading: false });
      return { success: true, data: updated };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  deleteListing: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/listings/delete/${id}`);
      const current = get().listings || [];
      set({
        listings: current.filter((l) => !(l._id === id || l.id === id)),
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  sortLocal: (sortType) => {
    const currentListings = [...get().listings];

    const sorted = currentListings.sort((a, b) => {
      // Ép kiểu về Number và fallback về 0 nếu dữ liệu lỗi
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;

      switch (sortType) {
        case "price_asc":
          return priceA - priceB; // Giá thấp -> cao
        case "price_desc":
          return priceB - priceA; // Giá cao -> thấp
        case "oldest":
          return dateA - dateB; // Cũ nhất -> mới nhất
        case "newest":
        default:
          return dateB - dateA; // Mới nhất -> cũ nhất
      }
    });

    set({ listings: sorted });
  },
}));
