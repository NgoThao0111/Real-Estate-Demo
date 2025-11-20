import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios"; // Import instance axios đã cấu hình credentials

const AuthContext = createContext();

// Hook để dùng Auth ở bất cứ đâu
export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang check session

  // Hàm để cập nhật user (dùng khi Login/Register thành công)
  const updateUser = (data) => {
    setCurrentUser(data);
  };

  // Check session khi F5 trang web
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/users/profile"); // Gọi tới getUserInfor

        // SỬA DÒNG NÀY: Lấy res.data.user thay vì res.data
        if (res.data.user) {
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
