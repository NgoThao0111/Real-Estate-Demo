import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useChatStore = create((set, get) => ({
  conversations: [],
  loading: false,
  error: null,

  // Lấy danh sách conversations
  getConversations: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/api/chats");
      set({ conversations: res.data.conversations || [], loading: false });
      return { success: true, data: res.data.conversations };
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateLastMessage: (newMessage) => {
    set((state) => {
      // 1. Tìm cuộc trò chuyện cần update
      const conversationId =
        typeof newMessage.conversation === "object"
          ? newMessage.conversation._id
          : newMessage.conversation;

      // Map để cập nhật tin nhắn cuối
      let updatedConversations = state.conversations.map((chat) => {
        if (chat._id === conversationId) {
          return { ...chat, lastMessage: newMessage };
        }
        return chat;
      });

      // 2. Sắp xếp: Đưa cuộc trò chuyện mới nhất lên đầu (BỎ COMMENT RA)
      updatedConversations.sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || 0);
        const dateB = new Date(b.lastMessage?.createdAt || 0);
        return dateB - dateA; // Mới nhất lên đầu
      });

      return { conversations: updatedConversations };
    });
  },

  // Tạo hoặc tìm conversation với user cụ thể
  createOrFindConversation: async (participantId) => {
    try {
      set({ loading: true, error: null });

      // Kiểm tra xem đã có conversation với user này chưa
      const existingConv = get().conversations.find((conv) =>
        conv.participants.some((p) => p._id === participantId)
      );

      if (existingConv) {
        set({ loading: false });
        return { success: true, data: existingConv };
      }

      // Tạo conversation mới
      const res = await axios.post("/api/chats", {
        participantIds: [participantId],
        type: "private",
      });

      const newConv = res.data.conversation;
      set({
        conversations: [newConv, ...get().conversations],
        loading: false,
      });

      return { success: true, data: newConv };
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Gửi tin nhắn
  sendMessage: async (conversationId, content, type = "text") => {
    try {
      const res = await axios.post(`/api/chats/${conversationId}/messages`, {
        content,
        type,
      });
      return { success: true, data: res.data.data };
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  // Lấy tin nhắn của conversation
  getMessages: async (conversationId, page = 1, limit = 30) => {
    try {
      const res = await axios.get(`/api/chats/${conversationId}/messages`, {
        params: { page, limit },
      });
      return { success: true, data: res.data.messages };
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return { success: false, message };
    }
  },
}));
