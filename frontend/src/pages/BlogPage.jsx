import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Avatar,
  Divider,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  useToast,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import blogApi from '../api/blogApi';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

// CSS styles specifically for markdown content
const markdownStyles = {
  p: {
    margin: '1rem 0',
    lineHeight: '1.7',
  },
  h1: {
    fontSize: '2xl',
    fontWeight: 'bold',
    borderBottom: '2px solid black',
    paddingBottom: '0.5rem',
    margin: '2rem 0 1rem 0',
  },
  h2: {
    fontSize: 'xl',
    fontWeight: 'bold',
    borderBottom: '2px solid black',
    paddingBottom: '0.3rem',
    margin: '1.5rem 0 1rem 0',
  },
  h3: {
    fontSize: 'lg',
    fontWeight: 'bold',
    margin: '1.5rem 0 0.75rem 0',
  },
  ul: {
    marginLeft: '2rem',
    marginBottom: '1rem',
    listStyle: 'disc',
  },
  ol: {
    marginLeft: '2rem',
    marginBottom: '1rem',
    listStyle: 'decimal',
  },
  li: {
    margin: '0.5rem 0',
  },
  blockquote: {
    borderLeft: '4px solid black',
    paddingLeft: '1rem',
    marginLeft: '0.5rem',
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: 'gray.100',
    padding: '0.2rem 0.4rem',
    borderRadius: '0',
    fontSize: '0.9rem',
  },
  pre: {
    fontFamily: 'monospace',
    backgroundColor: 'gray.100',
    padding: '1rem',
    overflowX: 'auto',
    marginY: '1rem',
    border: '2px solid black',
  },
  a: {
    color: 'brand.500',
    textDecoration: 'underline',
    _hover: {
      color: 'brand.600',
    },
  },
  img: {
    maxWidth: '100%',
    border: '2px solid black',
    marginY: '1rem',
    boxShadow: '4px 4px 0 black',
  },
  table: {
    width: '100%',
    marginY: '1rem',
    border: '2px solid black',
    borderCollapse: 'collapse',
  },
  th: {
    border: '2px solid black',
    padding: '0.5rem',
    backgroundColor: 'brand.100',
  },
  td: {
    border: '2px solid black',
    padding: '0.5rem',
  },
};

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Generate a random pastel color for the header background
  const pastelColors = [
    'rgba(255, 190, 111, 0.5)',  // soft orange
    'rgba(191, 220, 255, 0.5)',  // soft blue
    'rgba(250, 212, 255, 0.5)',  // soft purple
    'rgba(195, 255, 195, 0.5)',  // soft green
    'rgba(255, 200, 200, 0.5)',  // soft pink
  ];
  const bgColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBlogById(id);
        setBlog(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. It may have been deleted or you have no permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await blogApi.deleteBlog(id);
        toast({
          title: 'Blog deleted',
          description: 'Your blog post has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete blog. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner 
            thickness="4px"
            speed="0.65s"
            size="xl"
            color="brand.500"
          />
          <Text>Loading blog...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <VStack spacing={8} align="stretch" width="100%">
        <Alert 
          status="error" 
          variant="solid"
          borderRadius="0"
          border="3px solid black"
          boxShadow="5px 5px 0 black"
          mb={8}
        >
          <AlertIcon />
          {error}
        </Alert>
        <Center>
          <Button 
            as={RouterLink} 
            to="/" 
            variant="primary"
            leftIcon={<FaArrowLeft />}
          >
            Back to Home
          </Button>
        </Center>
      </VStack>
    );
  }

  if (!blog) return null;

  const formattedDate = format(new Date(blog.created_at), 'MMMM d, yyyy');
  const isAuthor = user && user.username === blog.author_username;

  return (
    <VStack spacing={8} align="stretch" width="100%">
      {/* Back button */}
      <Button
        as={RouterLink}
        to="/"
        variant="secondary"
        size="md"
        width="fit-content"
        leftIcon={<FaArrowLeft />}
      >
        Back to Blogs
      </Button>

      {/* Blog header */}
      <Box 
        bg={bgColor} 
        borderRadius="0" 
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        p={8}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative elements */}
        <Box 
          position="absolute" 
          w="30px" 
          h="30px" 
          bg="yellow.300" 
          border="3px solid black" 
          top="15px" 
          right="15px"
          borderRadius="50%"
        />
        <Box 
          position="absolute" 
          w="20px" 
          h="20px" 
          bg="brand.500" 
          border="3px solid black" 
          bottom="15px" 
          left="30px"
          transform="rotate(45deg)"
        />

        <Heading size="2xl" mb={4}>
          {blog.title}
        </Heading>

        <HStack spacing={4} wrap="wrap">
          {blog.tags.map((tag, index) => (
            <Badge
              key={index}
              bg="white"
              color="black"
              borderRadius="0"
              border="2px solid black"
              fontWeight="bold"
              py={1}
              px={3}
              mb={2}
            >
              {tag}
            </Badge>
          ))}
        </HStack>
      </Box>

      {/* Author info and controls */}
      <Flex 
        justifyContent="space-between" 
        alignItems="center"
        borderRadius="0"
        border="3px solid black"
        p={5}
        bg="white"
      >
        <HStack spacing={4}>
          <Avatar
            name={blog.author_username}
            bg="brand.500"
            color="white"
            size="md"
            border="2px solid black"
          />
          <Box>
            <Text fontWeight="bold">
              {blog.author_username}
            </Text>
            <Text fontSize="sm">
              {formattedDate}
            </Text>
          </Box>
        </HStack>

        {isAuthor && (
          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to={`/blogs/edit/${blog.id}`}
              variant="primary"
              leftIcon={<FaEdit />}
              size="sm"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<FaTrash />}
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </HStack>
        )}
      </Flex>

      {/* Blog content */}
      <Box 
        bg="white" 
        p={8} 
        borderRadius="0"
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        fontSize="lg"
        lineHeight="tall"
      >
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <Text sx={markdownStyles.p} {...props} />,
            h1: ({ node, ...props }) => <Heading as="h1" sx={markdownStyles.h1} {...props} />,
            h2: ({ node, ...props }) => <Heading as="h2" sx={markdownStyles.h2} {...props} />,
            h3: ({ node, ...props }) => <Heading as="h3" sx={markdownStyles.h3} {...props} />,
            ul: ({ node, ...props }) => <Box as="ul" sx={markdownStyles.ul} {...props} />,
            ol: ({ node, ...props }) => <Box as="ol" sx={markdownStyles.ol} {...props} />,
            li: ({ node, ...props }) => <Box as="li" sx={markdownStyles.li} {...props} />,
            blockquote: ({ node, ...props }) => <Box as="blockquote" sx={markdownStyles.blockquote} {...props} />,
            code: ({ node, inline, ...props }) => 
              inline ? 
              <Box as="code" sx={markdownStyles.code} display="inline" {...props} /> : 
              <Box as="pre" sx={markdownStyles.pre} {...props} />,
            a: ({ node, ...props }) => <Box as="a" sx={markdownStyles.a} {...props} />,
            img: ({ node, ...props }) => <Box as="img" sx={markdownStyles.img} {...props} />,
            table: ({ node, ...props }) => <Box as="table" sx={markdownStyles.table} {...props} />,
            th: ({ node, ...props }) => <Box as="th" sx={markdownStyles.th} {...props} />,
            td: ({ node, ...props }) => <Box as="td" sx={markdownStyles.td} {...props} />,
          }}
        >
          {blog.content}
        </ReactMarkdown>
      </Box>
    </VStack>
  );
};

export default BlogPage; 