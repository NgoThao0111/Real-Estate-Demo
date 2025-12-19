import { create } from "zustand";
import api from "../lib/axios.js"; // Import api instance
 
const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Lỗi không xác định";
 
export const useListStore = create((set, get) => ({
  listings: [],
  loading: false,
  error: null,
 
  fetchListings: async (params = {}, isBackground = false) => {
    try {
      if (!isBackground) set({ loading: true, error: null });
 
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== null && v !== "" && v !== undefined
        )
      );
 
      const queryString = new URLSearchParams(cleanParams).toString();
      // Endpoint này khớp với router.get("/search") trong listing.route.js
      // Và app.use("/api/listings") trong server.js
      const endpoint = `/listings/search?${queryString}`;
 
      const res = await api.get(endpoint);
     
      // Backend trả về { success: true, data: [...] } hoặc { listings: [...] }
      // Bạn cần check lại controller xem trả về key nào.
      // Trong searchListings controller bạn trả về 'data'.
      // Trong getListings controller bạn trả về 'listings'.
      // Code dưới đây handle cả 2 trường hợp:
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
      const res = await api.get(`/listings/${id}`);
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
      const res = await api.get(`/listings/my`); // Khớp router.get("/my")
      const data = res.data.listings || [];
      set({ listings: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },
 
  fetchUserListings: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/listings/user/${userId}`);
      const data = res.data.listings || [];
      set({ listings: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const message = extractError(err);
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },
 
  // Hàm này thực chất gọi API user, nhưng nằm ở list store cũng tạm chấp nhận được
  fetchSavedListings: async () => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/users/saved`); // Khớp user.route.js
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
      // Optimistic update ở đây hơi khó vì không quản lý state savedListings trong store này
      // (State đó nằm bên userStore). Nên chỉ gọi API thôi.
      set({ loading: true, error: null });
      const res = await api.post(`/users/save/${listingId}`);
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
      const res = await api.post(`/listings/createList`, payload); // Khớp router.post("/createList")
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
      // Lưu ý: router.put("/:id") -> url là /listings/:id
      const res = await api.put(`/listings/${id}`, payload);
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
      // Lưu ý: router.delete("/delete/:id") -> url là /listings/delete/:id
      await api.delete(`/listings/delete/${id}`);
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
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const areaA = Number(a.area) || 0; // Thêm sort area
      const areaB = Number(b.area) || 0;
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
 
      switch (sortType) {
        case "price_asc": return priceA - priceB;
        case "price_desc": return priceB - priceA;
        case "area_asc": return areaA - areaB; // Thêm case area
        case "area_desc": return areaB - areaA;
        case "oldest": return dateA - dateB;
        case "newest":
        default: return dateB - dateA;
      }
    });
 
    set({ listings: sorted });
  },
}));
 