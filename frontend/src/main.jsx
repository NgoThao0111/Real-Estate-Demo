import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'

import { SocketContextProvider } from './context/SocketContext.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx' // Bạn cần có cái này để quản lý user login

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <AuthContextProvider>
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </AuthContextProvider>
        
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)