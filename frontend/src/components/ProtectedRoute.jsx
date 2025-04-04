import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner 
            thickness="4px"
            speed="0.65s"
            size="xl"
            color="brand.500"
          />
          <Text fontWeight="bold">Checking authentication...</Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 