import { Box, useColorModeValue } from "@chakra-ui/react"
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
    <Box>
      {/* Sticky Navbar */}
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

      {/* Main Content with top padding to prevent overlap */}
      <Box 
        minH={"100vh"}  
        bg={useColorModeValue("gray.100", "gray.900")}
        pt={"64px"} // This should match your navbar height
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Box>
    </Box>
    </>
  )
}

export default App
