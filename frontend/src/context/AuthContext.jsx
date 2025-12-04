// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios"; 

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = (data) => {
    setCurrentUser(data);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // --- SỬA THÀNH ĐÚNG ENDPOINT ĐÃ LÀM Ở BACKEND ---
        const res = await api.get("/users/session"); 
        
        if (res.data.user) {
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.log("Auth check error:", err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false); // Tắt loading sau khi check xong
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