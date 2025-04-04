import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  VStack,
  HStack,
  Textarea,
  InputGroup,
  InputRightElement,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Divider,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaPlus, FaTimes, FaArrowLeft, FaMarkdown } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import blogApi from '../api/blogApi';

// Markdown styles (same as in other components)
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
};

const EditBlogPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
  });
  const [originalBlog, setOriginalBlog] = useState(null);
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBlogById(id);
        
        // Check if user is the author
        if (user && user.username !== data.author_username) {
          setError('You do not have permission to edit this blog');
          return;
        }
        
        setOriginalBlog(data);
        setFormData({
          title: data.title,
          content: data.content,
          tags: data.tags || [],
        });
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load the blog. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content should be at least 50 characters';
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

  const handleTagChange = (e) => {
    setCurrentTag(e.target.value);
  };

  const addTag = () => {
    if (currentTag.trim() !== '' && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await blogApi.updateBlog(id, {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
      });

      toast({
        title: 'Blog updated',
        description: 'Your blog post has been updated successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      
      // Navigate to the updated blog
      navigate(`/blogs/${id}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blog. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
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

  if (error || !originalBlog) {
    return (
      <Container maxW="container.md" py={16}>
        <Alert 
          status="error" 
          variant="solid"
          borderRadius="0"
          border="3px solid black"
          boxShadow="5px 5px 0 black"
          mb={8}
        >
          <AlertIcon />
          {error || 'Blog not found'}
        </Alert>
        <Center>
          <Button 
            as={RouterLink} 
            to="/dashboard" 
            variant="primary"
            leftIcon={<FaArrowLeft />}
          >
            Back to Dashboard
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={16}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box 
          bg="brand.500" 
          p={6} 
          borderRadius="0"
          border="3px solid black"
          boxShadow="6px 6px 0 black"
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
          <Heading color="white" size="xl" textAlign="center">Edit Blog Post</Heading>
        </Box>

        {/* Back button */}
        <Button
          as={RouterLink}
          to={`/blogs/${id}`}
          variant="secondary"
          size="md"
          width="fit-content"
          leftIcon={<FaArrowLeft />}
        >
          Back to Blog
        </Button>

        {/* Blog form */}
        <Box 
          as="form" 
          onSubmit={handleSubmit}
          bg="white"
          borderRadius="0"
          border="3px solid black"
          boxShadow="6px 6px 0 black"
          p={8}
        >
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={errors.title}>
              <FormLabel 
                fontWeight="bold"
                fontSize="lg"
              >
                Blog Title
              </FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter an engaging title"
                size="lg"
                variant="outline"
                borderRadius="0"
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: 'none',
                }}
              />
              <FormErrorMessage fontWeight="semibold">
                {errors.title}
              </FormErrorMessage>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel 
                fontWeight="bold"
                fontSize="lg"
              >
                Tags
              </FormLabel>
              <InputGroup size="md">
                <Input
                  value={currentTag}
                  onChange={handleTagChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags (press Enter to add)"
                  borderRadius="0"
                  pr="4.5rem"
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: 'none',
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button 
                    h="1.75rem" 
                    size="sm" 
                    onClick={addTag}
                    colorScheme="brand"
                    borderRadius="0"
                    border="1px solid black"
                  >
                    <FaPlus />
                  </Button>
                </InputRightElement>
              </InputGroup>

              {formData.tags.length > 0 && (
                <HStack spacing={2} mt={2} flexWrap="wrap">
                  {formData.tags.map((tag, index) => (
                    <Box 
                      key={index}
                      bg="white"
                      color="black"
                      px={3}
                      py={1}
                      borderRadius="0"
                      border="2px solid black"
                      mb={2}
                      display="flex"
                      alignItems="center"
                    >
                      <Text fontWeight="bold">{tag}</Text>
                      <Box 
                        as="button" 
                        ml={2} 
                        onClick={() => removeTag(tag)}
                        color="black"
                        _hover={{ color: 'red.500' }}
                      >
                        <FaTimes />
                      </Box>
                    </Box>
                  ))}
                </HStack>
              )}
            </FormControl>

            <FormControl isInvalid={errors.content} mt={4}>
              <FormLabel 
                fontWeight="bold" 
                fontSize="lg"
                display="flex"
                alignItems="center"
              >
                Content <FaMarkdown style={{ marginLeft: '8px' }} />
              </FormLabel>
              
              <Text fontSize="sm" mb={2}>
                Supports Markdown formatting for rich content
              </Text>

              <Tabs 
                variant="enclosed" 
                colorScheme="brand" 
                border="2px solid black"
                borderRadius="0"
              >
                <TabList mb="1em">
                  <Tab 
                    fontWeight="bold" 
                    _selected={{ 
                      bg: 'brand.100', 
                      borderBottom: 'none',
                      borderColor: 'black',
                    }}
                  >
                    Write
                  </Tab>
                  <Tab 
                    fontWeight="bold"
                    _selected={{ 
                      bg: 'brand.100', 
                      borderBottom: 'none',
                      borderColor: 'black',
                    }}
                  >
                    Preview
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p={0}>
                    <Textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your blog content here using Markdown..."
                      size="lg"
                      minH="400px"
                      resize="vertical"
                      borderRadius="0"
                      _focus={{
                        borderColor: 'brand.500',
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    {formData.content ? (
                      <Box 
                        minH="400px" 
                        p={4} 
                        border="1px solid" 
                        borderColor="gray.200"
                        borderRadius="0"
                        overflowY="auto"
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
                          }}
                        >
                          {formData.content}
                        </ReactMarkdown>
                      </Box>
                    ) : (
                      <Box 
                        minH="400px" 
                        p={4} 
                        border="1px solid" 
                        borderColor="gray.200"
                        borderRadius="0"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="gray.500">
                          Preview will appear here when you write something
                        </Text>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
              <FormErrorMessage fontWeight="semibold">
                {errors.content}
              </FormErrorMessage>
            </FormControl>

            <Divider borderColor="gray.300" my={4} />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              py={6}
              bg="brand.500"
              _hover={{
                bg: 'brand.600',
              }}
            >
              Update Blog Post
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditBlogPage; 