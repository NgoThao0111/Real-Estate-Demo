import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true; // Cho phép gửi cookie session

const extractError = (err) => err?.response?.data?.message || err?.message || "Lỗi không xác định";

export const useListStore = create((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  // Lấy tất cả tin đăng
  fetchListings: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/api/listings/getList");
      const data = res.data.listings || res.data || [];
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

  // Tạo tin đăng mới
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

  // Cập nhật tin đăng hiện tại
  updateListing: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put(`/api/listings/${id}`, payload);
      const updated = res.data.listing || res.data || null;
      if (updated) {
        const current = get().listings || [];
        set({ listings: current.map((l) => (l._id === id || l.id === id ? updated : l)) });
      }
      set({ loading: false });
      return { success: true, data: updated };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // Xóa tin đăng
  deleteListing: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/listings/delete/${id}`);
      const current = get().listings || [];
      set({ listings: current.filter((l) => !(l._id === id || l.id === id)), loading: false });
      return { success: true };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },
}));
