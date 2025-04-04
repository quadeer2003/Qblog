import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Text,
  VStack,
  HStack,
  Code,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import debugApi from '../api/debugApi';
import blogApi from '../api/blogApi';

const DebugPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [apiTests, setApiTests] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [blogs, setBlogs] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('black', 'gray.600');

  useEffect(() => {
    // Get client info on initial load
    setClientInfo(debugApi.getClientInfo());
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get API diagnostics
      const diagnosticsData = await debugApi.getDiagnostics().catch(err => {
        console.error('Diagnostics failed:', err);
        return { error: err.message };
      });
      setDiagnostics(diagnosticsData);
      
      // Run API tests
      const testsData = await debugApi.testBlogApi().catch(err => {
        console.error('API tests failed:', err);
        return { error: err.message };
      });
      setApiTests(testsData);

      // Try to fetch blogs directly
      try {
        const blogsData = await blogApi.getBlogs();
        setBlogs(blogsData);
      } catch (err) {
        console.error('Blog fetch failed:', err);
        setBlogs({ error: err.message });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format JSON for readability
  const prettyJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  // Render individual test result
  const TestResult = ({ test }) => (
    <Box 
      p={4} 
      border="2px solid" 
      borderColor={test.success ? 'green.400' : 'red.400'}
      borderRadius="md" 
      mb={3}
    >
      <HStack mb={2} justify="space-between">
        <Heading size="sm">{test.name}</Heading>
        <Badge 
          colorScheme={test.success ? 'green' : 'red'}
          variant="solid"
          borderRadius="md"
          px={2}
        >
          {test.success ? 'SUCCESS' : 'FAILED'}
        </Badge>
      </HStack>
      <Text fontSize="sm">{test.message}</Text>
      {test.status && (
        <HStack mt={2}>
          <Text fontSize="xs" fontWeight="bold">Status:</Text>
          <Text fontSize="xs">{test.status}</Text>
        </HStack>
      )}
      {test.timeMs && (
        <HStack mt={1}>
          <Text fontSize="xs" fontWeight="bold">Response time:</Text>
          <Text fontSize="xs">{test.timeMs}ms</Text>
        </HStack>
      )}
      {test.blogCount && (
        <HStack mt={1}>
          <Text fontSize="xs" fontWeight="bold">Blogs retrieved:</Text>
          <Text fontSize="xs">{test.blogCount}</Text>
        </HStack>
      )}
      {test.error && (
        <Box mt={2} p={2} bg="red.50" borderRadius="md">
          <Text fontSize="xs" fontWeight="bold" color="red.600">Error:</Text>
          <Text fontSize="xs" fontFamily="monospace">{test.error}</Text>
        </Box>
      )}
    </Box>
  );

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box
          bg={bgColor}
          p={6}
          borderRadius="md"
          boxShadow="lg"
          border="3px solid"
          borderColor={borderColor}
        >
          <Heading as="h1" size="xl" mb={6}>
            API Debug & Diagnostics
          </Heading>
          
          <Text mb={6}>
            This page helps diagnose API connection issues, especially for blog loading problems.
          </Text>
          
          <Button
            colorScheme="blue"
            onClick={runDiagnostics}
            isLoading={loading}
            loadingText="Running diagnostics..."
            mb={6}
          >
            Run Diagnostics
          </Button>

          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {loading && (
            <Box textAlign="center" my={8}>
              <Spinner size="xl" mb={4} />
              <Text>Running diagnostics...</Text>
            </Box>
          )}

          {clientInfo && (
            <Box mb={6}>
              <Heading as="h2" size="md" mb={3}>
                Client Information
              </Heading>
              <Box 
                bg="gray.50" 
                p={4} 
                borderRadius="md" 
                border="1px solid" 
                borderColor="gray.200"
                overflow="auto"
              >
                <HStack mb={2}>
                  <Text fontWeight="bold">API URL:</Text>
                  <Code>{clientInfo.apiUrl}</Code>
                </HStack>
                <HStack mb={2}>
                  <Text fontWeight="bold">Auth Token:</Text>
                  <Badge colorScheme={clientInfo.localStorage.token ? "green" : "red"}>
                    {clientInfo.localStorage.token ? "Present" : "Missing"}
                  </Badge>
                </HStack>
                <HStack mb={2}>
                  <Text fontWeight="bold">User Data:</Text>
                  <Badge colorScheme={clientInfo.localStorage.user ? "green" : "yellow"}>
                    {clientInfo.localStorage.user ? "Present" : "Missing"}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Browser:</Text>
                  <Text fontSize="sm" noOfLines={1}>{clientInfo.userAgent}</Text>
                </HStack>
              </Box>
            </Box>
          )}

          <Accordion allowMultiple defaultIndex={[]}>
            {apiTests && (
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading as="h3" size="md">
                      API Tests
                    </Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {apiTests.tests?.map((test, index) => (
                    <TestResult key={index} test={test} />
                  ))}
                  {apiTests.error && (
                    <Alert status="error">
                      <AlertIcon />
                      Failed to run API tests: {apiTests.error}
                    </Alert>
                  )}
                </AccordionPanel>
              </AccordionItem>
            )}

            {blogs && (
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading as="h3" size="md">
                      Blog Data
                    </Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {blogs.error ? (
                    <Alert status="error">
                      <AlertIcon />
                      Failed to load blogs: {blogs.error}
                    </Alert>
                  ) : (
                    <>
                      <HStack mb={3}>
                        <Text fontWeight="bold">Blogs Retrieved:</Text>
                        <Badge colorScheme="blue">{Array.isArray(blogs) ? blogs.length : 'Error'}</Badge>
                      </HStack>
                      <Box 
                        bg="gray.50" 
                        p={4} 
                        borderRadius="md" 
                        maxH="400px" 
                        overflow="auto"
                        fontFamily="monospace"
                        fontSize="xs"
                      >
                        <pre>{prettyJson(blogs)}</pre>
                      </Box>
                    </>
                  )}
                </AccordionPanel>
              </AccordionItem>
            )}

            {diagnostics && (
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading as="h3" size="md">
                      Server Diagnostics
                    </Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {diagnostics.error ? (
                    <Alert status="error">
                      <AlertIcon />
                      Failed to load server diagnostics: {diagnostics.error}
                    </Alert>
                  ) : (
                    <Box 
                      bg="gray.50" 
                      p={4} 
                      borderRadius="md" 
                      maxH="400px" 
                      overflow="auto"
                      fontFamily="monospace"
                      fontSize="xs"
                    >
                      <pre>{prettyJson(diagnostics)}</pre>
                    </Box>
                  )}
                </AccordionPanel>
              </AccordionItem>
            )}
          </Accordion>
        </Box>
      </VStack>
    </Container>
  );
};

export default DebugPage; 