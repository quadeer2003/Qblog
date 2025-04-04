import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Container, Center } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BlogPage from './pages/BlogPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import DebugPage from './pages/DebugPage';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Box minH="100vh" display="flex" flexDirection="column" width="100%">
              <Header />
              <Center width="100%">
                <Box 
                  flex="1" 
                  py={8} 
                  maxW="container.xl"
                  width="100%"
                  px={{ base: 4, md: 8 }}
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/blogs/:id" element={<BlogPage />} />
                    <Route 
                      path="/blogs/create" 
                      element={
                        <ProtectedRoute>
                          <CreateBlogPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/blogs/edit/:id" 
                      element={
                        <ProtectedRoute>
                          <EditBlogPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/debug" element={<DebugPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Box>
              </Center>
              <Footer />
            </Box>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
