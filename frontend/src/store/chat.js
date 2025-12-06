import { create } from "zustand";
import api from "../lib/axios.js"; // <--- SỬA: Dùng api instance

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,

  // Lấy danh sách cuộc trò chuyện
  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/chats"); // Dùng api.get
      set({ chats: res.data.conversations, loading: false });
    } catch (err) {
      console.log(err);
      set({ loading: false, error: "Failed to fetch chats" });
    }
  },

  // Chọn một cuộc trò chuyện
  setCurrentChat: async (chat) => {
    set({ currentChat: chat, messages: [], loading: true });
    try {
      const res = await api.get(`/chats/${chat._id}/messages`);
      set({ messages: res.data.messages, loading: false });
      
      // Mark read ngay khi mở chat
      // (Có thể gọi ngầm không cần await để nhanh)
      api.put(`/chats/${chat._id}/read`); 
      
    } catch (err) {
      console.log(err);
      set({ loading: false });
    }
  },

  // Gửi tin nhắn
  sendMessage: async (content, chatId) => {
    // Optimistic Update (Thêm tin nhắn vào list trước khi server trả về)
    const tempId = Date.now().toString();
    const tempMsg = {
        _id: tempId,
        content,
        sender: { _id: "me" }, // Giả định người gửi là mình
        createdAt: new Date().toISOString(),
        pending: true // Cờ đánh dấu đang gửi
    };

    set((state) => ({ messages: [tempMsg, ...state.messages] }));

    try {
      const res = await api.post(`/chats/${chatId}/messages`, { content });
      
      // Server trả về tin nhắn thật -> Thay thế tin nhắn tạm
      set((state) => ({
        messages: state.messages.map((msg) => 
            msg._id === tempId ? res.data.data : msg
        ),
      }));
      
      // Update lại lastMessage trong danh sách chat (để chat nhảy lên đầu)
      get().fetchChats(); 

    } catch (err) {
      console.log(err);
      // Xóa tin nhắn tạm nếu lỗi (hoặc hiện nút thử lại)
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId)
      }));
    }
  },

  // Nhận tin nhắn từ Socket (Real-time)
  addMessage: (message) => {
    const currentChat = get().currentChat;
    
    // Chỉ thêm nếu tin nhắn thuộc chat đang mở
    if (currentChat && message.conversation === currentChat._id) {
        set((state) => ({ messages: [message, ...state.messages] }));
        
        // Mark read ngay
        api.put(`/chats/${currentChat._id}/read`);
    }
    
    // Luôn reload danh sách chat để cập nhật lastMessage
    get().fetchChats();
  },
}));