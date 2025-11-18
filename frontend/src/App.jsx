import { Box, useColorModeValue } from "@chakra-ui/react"
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import MyPostsPage from "./pages/MyPostsPage.jsx";
import SavedPostsPage from "./pages/SavedPostsPage.jsx";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
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
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/saved-posts" element={<SavedPostsPage />} />
        </Routes>
      </Box>
    </Box>
    </>
  )
}

export default App
