import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Box,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Divider,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  useBreakpointValue,
  useToast,
  Code,
} from '@chakra-ui/react';
import { FaPlus, FaUser } from 'react-icons/fa';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../contexts/AuthContext';
import blogApi from '../api/blogApi';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Responsive column count
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Please login to view your dashboard',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login');
      return;
    }

    const fetchUserBlogs = async () => {
      try {
        setLoading(true);
        console.log('Current user:', user);
        
        if (!user?.id) {
          console.error('User ID not available', user);
          throw new Error('User ID not available');
        }
        
        // Use the user ID from the auth context to fetch blogs
        const data = await blogApi.getUserBlogs(user.username);
        console.log('Fetched blogs:', data);
        setBlogs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user blogs:', error);
        setError(`Failed to load your blogs: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserBlogs();
    }
  }, [user, navigate, toast, token]);

  return (
    <Container maxW="container.xl" py={16}>
      <VStack spacing={12} align="stretch">
        {/* Header */}
        <Box 
          bg="brand.500" 
          p={8} 
          borderRadius="0"
          border="3px solid black"
          boxShadow="6px 6px 0 black"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative elements */}
          <Box 
            position="absolute" 
            w="40px" 
            h="40px" 
            bg="yellow.300" 
            border="3px solid black" 
            top="15px" 
            right="15px"
            transform="rotate(15deg)"
          />
          <Box 
            position="absolute" 
            w="20px" 
            h="20px" 
            bg="accent.500" 
            border="3px solid black" 
            bottom="15px" 
            left="40px"
          />

          <Flex 
            justify="space-between" 
            align="center" 
            position="relative"
            zIndex="1"
            flexDirection={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Heading color="white" size="xl" mb={2}>
                My Dashboard
              </Heading>
              <HStack spacing={2}>
                <FaUser />
                <Text color="white" fontSize="lg" fontWeight="bold">
                  Welcome, {user?.username || 'User'}!
                </Text>
              </HStack>
            </Box>
            <Button 
              as={RouterLink} 
              to="/blogs/create" 
              variant="secondary"
              size="lg"
              leftIcon={<FaPlus />}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "7px 7px 0 black",
              }}
            >
              Create New Blog
            </Button>
          </Flex>
        </Box>

        {/* User information - for debugging */}
        <Box 
          borderRadius="0"
          border="3px solid black"
          p={6}
          bg="gray.50"
          boxShadow="6px 6px 0 black"
          display={process.env.NODE_ENV === 'development' ? 'block' : 'none'}
        >
          <Heading as="h3" size="md" mb={3}>Debug Information</Heading>
          <Text mb={2}><strong>User ID:</strong> {user?.id || 'Not available'}</Text>
          <Text mb={2}><strong>Username:</strong> {user?.username || 'Not available'}</Text>
          <Text mb={2}><strong>Email:</strong> {user?.email || 'Not available'}</Text>
          <Text><strong>Authenticated:</strong> {token ? 'Yes' : 'No'}</Text>
        </Box>

        {/* Blog posts section */}
        <Box 
          borderRadius="0"
          border="3px solid black"
          p={8}
          bg="white"
          boxShadow="6px 6px 0 black"
        >
          <Heading as="h2" size="lg" mb={6} textTransform="uppercase">
            Your Blog Posts
          </Heading>

          {loading ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Spinner 
                  thickness="4px"
                  speed="0.65s"
                  size="xl"
                  color="brand.500"
                />
                <Text>Loading your amazing content...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Alert 
              status="error" 
              variant="solid" 
              borderRadius="0"
              border="3px solid black"
            >
              <AlertIcon />
              {error}
            </Alert>
          ) : blogs.length === 0 ? (
            <Box 
              textAlign="center" 
              py={16}
              border="3px dashed black"
              borderRadius="0"
              bg="gray.50"
            >
              <Heading size="md" mb={4}>No blogs found</Heading>
              <Text fontSize="lg" mb={8}>
                You haven't created any blogs yet. Let's get started!
              </Text>
              <Button 
                as={RouterLink} 
                to="/blogs/create" 
                variant="primary"
                size="lg"
                leftIcon={<FaPlus />}
              >
                Create Your First Blog
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={columns} spacing={8}>
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default DashboardPage; 