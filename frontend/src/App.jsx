import {
  Box,
  useColorModeValue,
  Center,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AnimatedBackground from "./components/AnimatedBackground.jsx";

import UserProfilePage from "./pages/UserProfilePage.jsx";

import { useAuthContext } from "./context/AuthContext.jsx";

function App() {
  const { currentUser, isLoading, logout } = useAuthContext();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout?.(); // clear user nếu có
      onOpen(); // mở modal login
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout, onOpen]);

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
        {/* Animated Background - Luôn tồn tại */}
        <AnimatedBackground />

        {/* Navbar luôn tồn tại – KHÔNG bị unmount */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderBottom="2px"
          borderColor="blue.300"
        >
          <Navbar onOpenAuthModal={onOpen} />
        </Box>

        <Box
          minH="100vh"
          bg="transparent"
          pt="64px"
          px={{ base: "8px", md: "16px", lg: "24px" }}
          pb="24px"
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home-panel" element={<HomePanel />} />
            <Route path="/listings" element={<AllListings />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />

            {/* Protected */}
            <Route
              path="/my-posts"
              element={
                currentUser ? <MyPostsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/saved-posts"
              element={
                currentUser ? <SavedPostsPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/chat"
              element={currentUser ? <ChatPage /> : <Navigate to="/" replace />}
            />

            <Route
              path="/profile"
              element={
                currentUser ? <UserProfilePage /> : <Navigate to="/" replace />
              }
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

        {/* Modal login – KHÔNG reload, KHÔNG redirect */}
        <AuthModal isOpen={isOpen} onClose={onClose} defaultMode="login" />
      </Box>
    </AOSComponent>
  );
}

export default App;
