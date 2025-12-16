import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "./AuthContext"; 
import { useUserStore } from "../store/user"; // Giả sử store này lưu accessToken
import { useToast } from "@chakra-ui/react"; // Dùng hook này nhẹ hơn

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { currentUser } = useAuthContext();
  
  // 1. Cần lấy Access Token từ Store (Zustand/Context/LocalStorage)
  // Bạn cần đảm bảo lúc login xong, bạn đã lưu accessToken vào đây
  const accessToken = useUserStore((state) => state.accessToken); 

  const toast = useToast();

  useEffect(() => {
    // CHỈ KẾT NỐI KHI CÓ USER VÀ ACCESS TOKEN
    if (currentUser && accessToken) {
      
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://localhost:5000"; // Lưu ý https nếu local chạy https

      // 2. Cấu hình gửi Access Token qua Auth
      const newSocket = io(SOCKET_URL, {
        withCredentials: true, // Vẫn giữ để gửi cookie (nếu cần cho cors)
        auth: {
            token: `Bearer ${accessToken}` // <--- QUAN TRỌNG: Backend chờ cái này
        },
        query: {
            userId: currentUser._id 
        },
        transports: ["websocket", "polling"]
      });

      setSocket(newSocket);

      // --- LISTENERS ---

      // System Notifications
      newSocket.on("system_notification", (payload) => {
        toast({
          title: payload.title || "Thông báo hệ thống",
          description: payload.message,
          status: payload.type === "alert" ? "error" : payload.type === "warning" ? "warning" : "info",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });

      // Force Logout (Banned)
      const logoutUser = useUserStore.getState().logoutUser;
      newSocket.on("force_logout", async (payload) => {
        toast({
          title: "Tài khoản bị khóa",
          description: payload?.message || "Vui lòng liên hệ quản trị viên.",
          status: "error",
          duration: 8000,
          isClosable: true,
          position: "top-right",
        });

        try {
          await logoutUser();
          newSocket.disconnect(); // Ngắt kết nối ngay lập tức
        } catch (e) {
          window.location.href = "/";
        }
      });

      // Listing Status
      newSocket.on('listing_status_changed', (payload) => {
        toast({
          title: `Trạng thái tin đăng: ${payload.status}`,
          description: `Tin đăng #${payload.listingId} của bạn đã được cập nhật.`,
          status: payload.status === 'approved' ? 'success' : payload.status === 'rejected' ? 'error' : 'info',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      });
      
      // Xử lý lỗi connect (ví dụ Token hết hạn ngay lúc connect)
      newSocket.on("connect_error", (err) => {
          console.log("Socket connect error:", err.message);
          // Nếu lỗi là Authentication error, có thể token đã hết hạn
          // Frontend nên để cơ chế tự động refresh token lo liệu việc này ở API call
      });

      // Cleanup
      return () => { newSocket.close(); }
    } else {
      // Nếu logout hoặc mất token
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [currentUser, accessToken]); // <--- Thêm accessToken vào đây để reconnect khi token mới

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};