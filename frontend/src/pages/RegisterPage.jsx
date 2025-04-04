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
  Text,
  Link,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setRegisterError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Log registration attempt
      console.log("Attempting to register with:", {
        username: formData.username,
        email: formData.email,
        passwordLength: formData.password?.length
      });
      
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Welcome to QBlog!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        navigate('/login');
      } else {
        setRegisterError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch" width="100%" py={8}>
      {/* Decorative header */}
      <Box 
        bg="accent.500" 
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
          bg="brand.500" 
          border="3px solid black" 
          bottom="15px" 
          left="15px"
          transform="rotate(45deg)"
        />
        
        <Heading color="white" size="xl">Join QBlog Today!</Heading>
      </Box>

      {/* Error message */}
      {registerError && (
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
          {registerError}
        </Alert>
      )}

      {/* Registration form */}
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
              Username
            </FormLabel>
            <Input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'accent.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.username}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.email}>
            <FormLabel 
              fontWeight="bold"
              fontSize="lg"
            >
              Email
            </FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'accent.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.email}
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
              placeholder="Create a password"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'accent.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.password}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.confirmPassword}>
            <FormLabel 
              fontWeight="bold"
              fontSize="lg"
            >
              Confirm Password
            </FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              size="lg"
              variant="outline"
              borderRadius="0"
              _focus={{
                borderColor: 'accent.500',
                boxShadow: 'none',
              }}
            />
            <FormErrorMessage fontWeight="semibold">
              {errors.confirmPassword}
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
            bg="accent.500"
            _hover={{
              bg: 'accent.600',
            }}
          >
            Create Account
          </Button>
        </VStack>
      </Box>

      <HStack justifyContent="center" spacing={2} mt={4}>
        <Text>Already have an account?</Text>
        <Link 
          as={RouterLink} 
          to="/login" 
          color="accent.500" 
          fontWeight="bold"
          textDecoration="underline"
          _hover={{
            color: 'accent.600',
            textDecoration: 'none',
          }}
        >
          Log in here
        </Link>
      </HStack>
    </VStack>
  );
};

export default RegisterPage; 