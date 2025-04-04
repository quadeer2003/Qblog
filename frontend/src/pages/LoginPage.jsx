import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log("Attempting login with username:", formData.username);
      
      const success = await login(formData.username, formData.password);
      
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        navigate('/');
      } else {
        setLoginError('Invalid credentials. Please check your username/email and password and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch" width="100%" py={8}>
      {/* Decorative header */}
      <Box 
        bg="brand.500" 
        p={6} 
        borderRadius="0"
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        textAlign="center"
        position="relative"
        mb={8}
      >
        {/* Decorative elements */}
        <Box 
          position="absolute" 
          w="20px" 
          h="20px" 
          bg="yellow.300" 
          border="3px solid black" 
          top="15px" 
          right="15px"
        />
        <Box 
          position="absolute" 
          w="20px" 
          h="20px" 
          bg="green.300" 
          border="3px solid black" 
          bottom="15px" 
          left="15px"
          transform="rotate(45deg)"
        />
        
        <Heading color="white" size="xl">Welcome Back!</Heading>
      </Box>

      {/* Error message */}
      {loginError && (
        <Alert 
          status="error" 
          borderRadius="0"
          border="3px solid black"
          bg="red.300"
          color="black"
          fontWeight="bold"
          mb={4}
        >
          <AlertIcon color="black" />
          {loginError}
        </Alert>
      )}

      {/* Login form */}
      <Box 
        as="form" 
        onSubmit={handleSubmit}
        bg="white"
        borderRadius="0"
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        p={8}
      >
        <VStack spacing={6}>
          <FormControl isInvalid={errors.username}>
            <FormLabel 
              fontWeight="bold"
              fontSize="lg"
            >
              Username or Email
            </FormLabel>
            <Input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'brand.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.username}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel 
              fontWeight="bold"
              fontSize="lg"
            >
              Password
            </FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'brand.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.password}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            w="100%"
            mt={4}
            py={6}
            fontSize="lg"
            textTransform="uppercase"
          >
            Log In
          </Button>
        </VStack>
      </Box>

      <HStack justifyContent="center" spacing={2} mt={4}>
        <Text>Don't have an account?</Text>
        <Link 
          as={RouterLink} 
          to="/register" 
          color="brand.500" 
          fontWeight="bold"
          textDecoration="underline"
          _hover={{
            color: 'brand.600',
            textDecoration: 'none',
          }}
        >
          Register here
        </Link>
      </HStack>
    </VStack>
  );
};

export default LoginPage; 