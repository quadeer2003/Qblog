import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="black"
      color="white"
      py={8}
      borderTop="4px solid"
      borderColor="yellow.300"
      width="100%"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} mx="auto">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 6, md: 8 }}
          justify="space-between"
          align={{ base: 'center', md: 'center' }}
        >
          {/* Copyright and tagline */}
          <Stack spacing={2} align={{ base: 'center', md: 'flex-start' }}>
            <Text fontSize="2xl" fontWeight="extrabold">
              QBlog
            </Text>
            <Text fontSize="sm">
              Share your thoughts with the world
            </Text>
            <Text fontSize="sm" opacity={0.8}>
              © {new Date().getFullYear()} QBlog. All rights reserved
            </Text>
          </Stack>

          {/* Links */}
          <Stack 
            direction={{ base: 'column', sm: 'row' }} 
            spacing={{ base: 3, sm: 8 }}
            fontSize="sm"
            fontWeight="semibold"
          >
            <Link 
              href="#" 
              position="relative"
              _hover={{ 
                textDecoration: 'none',
                color: 'yellow.300'
              }}
            >
              About
            </Link>
            <Link 
              href="#" 
              position="relative"
              _hover={{ 
                textDecoration: 'none',
                color: 'yellow.300'
              }}
            >
              Privacy
            </Link>
            <Link 
              href="#" 
              position="relative"
              _hover={{ 
                textDecoration: 'none',
                color: 'yellow.300'
              }}
            >
              Terms
            </Link>
            <Link 
              href="#" 
              position="relative"
              _hover={{ 
                textDecoration: 'none',
                color: 'yellow.300'
              }}
            >
              Contact
            </Link>
          </Stack>

          {/* Social Icons */}
          <HStack spacing={4}>
            <IconButton
              aria-label="GitHub"
              icon={<FaGithub />}
              variant="outline"
              borderRadius="0"
              borderColor="white"
              size="md"
              _hover={{ 
                bg: 'yellow.300',
                color: 'black',
                borderColor: 'yellow.300'
              }}
            />
            <IconButton
              aria-label="Twitter"
              icon={<FaTwitter />}
              variant="outline"
              borderRadius="0"
              borderColor="white"
              size="md"
              _hover={{ 
                bg: 'yellow.300',
                color: 'black',
                borderColor: 'yellow.300'
              }}
            />
            <IconButton
              aria-label="Instagram"
              icon={<FaInstagram />}
              variant="outline"
              borderRadius="0"
              borderColor="white"
              size="md"
              _hover={{ 
                bg: 'yellow.300',
                color: 'black',
                borderColor: 'yellow.300'
              }}
            />
            <IconButton
              aria-label="LinkedIn"
              icon={<FaLinkedin />}
              variant="outline"
              borderRadius="0"
              borderColor="white"
              size="md"
              _hover={{ 
                bg: 'yellow.300',
                color: 'black',
                borderColor: 'yellow.300'
              }}
            />
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 