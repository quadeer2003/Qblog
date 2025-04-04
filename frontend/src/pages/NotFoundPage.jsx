import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading, Text, Button, Container, VStack, Image } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <VStack spacing={8} align="stretch" width="100%" py={8}>
      <Box 
        bg="red.300" 
        p={8} 
        borderRadius="0"
        border="3px solid black"
        boxShadow="6px 6px 0 black"
        textAlign="center"
        position="relative"
      >
        {/* Decorative elements */}
        <Box 
          position="absolute" 
          w="25px" 
          h="25px" 
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
          bg="brand.500" 
          border="3px solid black" 
          bottom="15px" 
          left="15px"
        />
        
        <Heading 
          as="h1" 
          size="4xl" 
          fontWeight="black"
          mb={4}
        >
          404
        </Heading>
        <Heading 
          as="h2" 
          size="xl"
          mb={4}
        >
          Page Not Found
        </Heading>
        <Text 
          fontSize="xl" 
          fontWeight="medium"
          mb={8}
        >
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          variant="primary"
          size="lg"
          leftIcon={<FaArrowLeft />}
          py={6}
          px={8}
          fontSize="lg"
        >
          Return to Home
        </Button>
      </Box>
    </VStack>
  );
};

export default NotFoundPage; 