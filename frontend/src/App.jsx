import {
  Box,
  useColorModeValue,
  Center,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react"; // 1. Import useEffect

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import HomePanel from "./components/HomePanel.jsx";
import MyPostsPage from "./pages/MyPostsPage.jsx";
import SavedPostsPage from "./pages/SavedPostsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import AllListings from "./pages/AllListings.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import AOSComponent from "./components/AOSComponent.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx"; // 2. Import AuthModal

// Import Hook từ AuthContext
import { useAuthContext } from "./context/AuthContext.jsx";

function App() {
  // Lấy currentUser và isLoading từ Context
  const { currentUser, isLoading } = useAuthContext();

  // 3. Hook quản lý trạng thái đóng/mở của Modal Login
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 4. LẮNG NGHE SỰ KIỆN TỪ AXIOS
  useEffect(() => {
    const shouldOpenModal = localStorage.getItem("triggerLoginModal");

    if (shouldOpenModal) {
      onOpen(); // Mở modal ngay
      localStorage.removeItem("triggerLoginModal"); // Xóa cờ ngay để F5 không bị mở lại
    }

    // Hàm xử lý khi nhận được tín hiệu "hết hạn phiên"
    const handleAuthError = () => {
      // Có thể thêm logic: Thông báo hoặc reset state user tạm thời nếu cần
      // Nhưng quan trọng nhất là mở Modal lên:
      onOpen();
    };

    // Đăng ký lắng nghe sự kiện 'auth:unauthorized' (tên phải khớp bên axios.js)
    window.addEventListener("auth:unauthorized", handleAuthError);

    // Dọn dẹp sự kiện khi component unmount (tránh rò rỉ bộ nhớ)
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthError);
    };
  }, [onOpen]);

  // Hiển thị màn hình chờ
  if (isLoading) {
    return (
      <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <Center h="100vh">
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
          />
        </Center>
      </Box>
    );
  }

  return (
    <AOSComponent>
      <Box>
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderBottom={"2px"}
          borderColor={"blue.300"}
        >
          {/* Truyền onOpen cho Navbar để nút "Đăng nhập" trên menu cũng mở được Modal này */}
          <Navbar onOpenAuthModal={onOpen} />
        </Box>

        <Box
          minH={"100vh"}
          bg={useColorModeValue("gray.100", "gray.900")}
          pt={"64px"}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home-panel" element={<HomePanel />} />
            <Route path="/listings" element={<AllListings />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />

            {/* Protected Routes */}
            <Route
              path="/my-posts"
              element={currentUser ? <MyPostsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/saved-posts"
              element={currentUser ? <SavedPostsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/chat"
              element={currentUser ? <ChatPage /> : <Navigate to="/" />}
            />
          </Routes>
        </Box>

        {currentUser && <ChatWidget />}
        <Footer />

        {/* 5. Đặt AuthModal ở đây - Luôn nằm trong DOM nhưng ẩn/hiện theo biến isOpen */}
        <AuthModal isOpen={isOpen} onClose={onClose} defaultMode="login" />
      </Box>
    </AOSComponent>
  );
}

export default App;
