import { Box, useColorModeValue, Center, Spinner } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";

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

// 1. Import Hook từ AuthContext
import { useAuthContext } from "./context/AuthContext.jsx";

function App() {
  // 2. Lấy currentUser và isLoading từ Context
  // KHÔNG DÙNG useUserStore để check session nữa
  const { currentUser, isLoading } = useAuthContext();

  // 3. Hiển thị màn hình chờ (Dựa trên isLoading của Context)
  if (isLoading) {
    return (
      <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <Center h="100vh">
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" />
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
          <Navbar />
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
            
            {/* Protected Routes: Dùng currentUser để kiểm tra */}
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

        {/* Chỉ hiện ChatWidget khi có user */}
        {currentUser && <ChatWidget />}
        <Footer/>
      </Box>
    </AOSComponent>
  );
}

export default App;