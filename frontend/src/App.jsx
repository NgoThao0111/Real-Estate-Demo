import {
  Box,
  useColorModeValue,
  Center,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import DashboardOverview from "./pages/Admin/DashboardOverview.jsx";
import PropertyManager from "./pages/Admin/PropertyManager.jsx";
import UserManager from "./pages/Admin/UserManager.jsx";
import MessageCenter from "./pages/Admin/MessageCenter.jsx";
import ReportsManager from "./pages/Admin/ReportsManager.jsx";
import AdminActions from "./pages/Admin/AdminActions.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
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
import AuthModal from "./components/AuthModal.jsx";

// --- THAY ĐỔI 1: Bỏ useAuthContext, dùng hoàn toàn useUserStore ---
// import { useAuthContext } from "./context/AuthContext.jsx"; 
import { useUserStore } from "./store/user.js"; 

function App() {
  // --- THAY ĐỔI 2: Lấy state từ Zustand Store (Nơi checkAuth cập nhật dữ liệu) ---
  const { user: currentUser, isCheckingAuth, checkAuth } = useUserStore();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // --- THAY ĐỔI 3: Dependency Array rỗng [] ---
  // Chỉ chạy đúng 1 lần khi App vừa tải (Mount), không chạy lại khi checkAuth thay đổi
  useEffect(() => {
    checkAuth();
  }, []); 

  // --- Logic lắng nghe sự kiện Logout từ Axios ---
  useEffect(() => {
    const shouldOpenModal = localStorage.getItem("triggerLoginModal");
    if (shouldOpenModal) {
      onOpen();
      localStorage.removeItem("triggerLoginModal");
    }

    const handleAuthError = () => {
      onOpen();
    };

    window.addEventListener("auth:unauthorized", handleAuthError);
    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthError);
    };
  }, [onOpen]);

  // Hiển thị màn hình chờ
  if (isCheckingAuth) {
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

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="properties" element={<PropertyManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="messages" element={<MessageCenter />} />
              <Route path="actions" element={<AdminActions />} />
              <Route path="reports" element={<ReportsManager />} />
            </Route>
          </Routes>
        </Box>

        {currentUser && <ChatWidget />}
        <Footer />

        <AuthModal isOpen={isOpen} onClose={onClose} defaultMode="login" />
      </Box>
    </AOSComponent>
  );
}

export default App;