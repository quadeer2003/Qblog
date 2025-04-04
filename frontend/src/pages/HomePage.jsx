import { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Flex,
  VStack,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BlogCard from '../components/BlogCard';
import blogApi from '../api/blogApi';

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Responsive column count
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * pageSize;
        const data = await blogApi.getBlogs({ skip, limit: pageSize });
        setBlogs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage]);

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <VStack spacing={12} align="stretch" width="100%">
      {/* Hero section */}
      <Box 
        py={16} 
        px={8} 
        bg="yellow.300" 
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        position="relative"
        borderRadius="0"
        overflow="hidden"
        textAlign="center"
      >
        {/* Decorative elements */}
        <Box 
          position="absolute" 
          w="40px" 
          h="40px" 
          bg="brand.500" 
          border="3px solid black" 
          top="20px" 
          right="20px"
          transform="rotate(15deg)"
        />
        <Box 
          position="absolute" 
          w="20px" 
          h="20px" 
          bg="accent.500" 
          border="3px solid black" 
          bottom="30px" 
          left="40px"
        />
        <Box 
          position="absolute" 
          w="30px" 
          h="30px" 
          bg="green.300" 
          border="3px solid black" 
          top="40px" 
          left="10%"
          transform="rotate(45deg)"
        />

        <Heading 
          as="h1" 
          size="2xl" 
          mb={4}
          textTransform="uppercase"
          position="relative"
          zIndex="1"
        >
          Welcome to QBlog
        </Heading>
        <Text 
          fontSize="xl" 
          maxW="800px" 
          mx="auto" 
          position="relative"
          zIndex="1"
        >
          Discover interesting articles and share your thoughts with the world
        </Text>
      </Box>

      {/* Search bar */}
      <Box 
        borderRadius="0" 
        border="3px solid black"
        p={6}
        bg="white"
        boxShadow="5px 5px 0 black"
      >
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search blogs by title, content, or tag..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outline"
            _focus={{ 
              boxShadow: "none", 
              borderColor: "brand.500",
            }}
          />
        </InputGroup>
      </Box>

      {/* Blog posts */}
      {loading ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner 
              thickness="4px"
              speed="0.65s"
              size="xl"
              color="brand.500"
            />
            <Text>Loading amazing content...</Text>
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
      ) : filteredBlogs.length === 0 ? (
        <Box 
          textAlign="center" 
          py={16}
          border="3px dashed black"
          borderRadius="0"
          bg="gray.50"
        >
          <Heading size="lg" mb={4}>No blogs found</Heading>
          <Text fontSize="lg" mb={8}>
            No blogs match your search criteria.
          </Text>
          {searchTerm && (
            <Button 
              onClick={() => setSearchTerm('')}
              variant="secondary"
            >
              Clear Search
            </Button>
          )}
        </Box>
      ) : (
        <>
          <SimpleGrid columns={columns} spacing={8}>
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </SimpleGrid>

          {/* Pagination */}
          <HStack justify="center" my={8} spacing={4}>
            <Button
              onClick={handlePrevPage}
              isDisabled={currentPage === 1}
              variant="secondary"
              leftIcon={
                <Box as="span" fontSize="xl" mb="2px">
                  ←
                </Box>
              }
            >
              Previous
            </Button>
            <Box 
              py={2} 
              px={4} 
              border="2px solid black" 
              fontWeight="bold"
            >
              {currentPage}
            </Box>
            <Button
              onClick={handleNextPage}
              isDisabled={blogs.length < pageSize}
              variant="secondary"
              rightIcon={
                <Box as="span" fontSize="xl" mb="2px">
                  →
                </Box>
              }
            >
              Next
            </Button>
          </HStack>
        </>
      )}
    </VStack>
  );
};

export default HomePage;

 