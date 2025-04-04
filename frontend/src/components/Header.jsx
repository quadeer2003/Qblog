import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  useDisclosure,
  IconButton,
  Collapse,
  HStack,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box 
      as="header" 
      bg="yellow.300" 
      borderBottom="4px solid black"
      position="sticky"
      top="0"
      zIndex="sticky"
      width="100%"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} mx="auto">
        <Flex 
          h="70px" 
          alignItems="center" 
          justifyContent="space-between"
        >
          {/* Logo */}
          <Text
            as={RouterLink}
            to="/"
            fontWeight="extrabold"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="tight"
            textTransform="uppercase"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-2px',
              left: '0',
              width: '100%',
              height: '4px',
              bg: 'black',
              transform: 'scaleX(0)',
              transformOrigin: 'right',
              transition: 'transform 0.3s',
            }}
            _hover={{
              _after: {
                transform: 'scaleX(1)',
                transformOrigin: 'left',
              }
            }}
          >
            QBlog
          </Text>

          {/* Desktop Navigation */}
          <HStack 
            spacing={8} 
            display={{ base: 'none', md: 'flex' }}
          >
            <Link 
              as={RouterLink} 
              to="/"
              fontWeight="semibold"
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                width: '100%',
                height: '2px',
                bg: 'black',
                transform: 'scaleX(0)',
                transformOrigin: 'right',
                transition: 'transform 0.3s',
              }}
              _hover={{
                textDecoration: 'none',
                _after: {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                }
              }}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                as={RouterLink} 
                to="/blogs/create"
                fontWeight="semibold"
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: '0',
                  width: '100%',
                  height: '2px',
                  bg: 'black',
                  transform: 'scaleX(0)',
                  transformOrigin: 'right',
                  transition: 'transform 0.3s',
                }}
                _hover={{
                  textDecoration: 'none',
                  _after: {
                    transform: 'scaleX(1)',
                    transformOrigin: 'left',
                  }
                }}
              >
                Create Blog
              </Link>
            )}
          </HStack>

          {/* Mobile Toggle Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="outline"
            aria-label="Toggle Navigation"
            border="2px solid black"
            size="lg"
          />

          {/* Auth Buttons (Desktop) */}
          <HStack 
            spacing={4} 
            display={{ base: 'none', md: 'flex' }}
          >
            {isAuthenticated ? (
              <>
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  variant="secondary"
                  leftIcon={<AddIcon />}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="danger"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="secondary"
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>
        </Flex>

        {/* Mobile Menu */}
        <Collapse in={isOpen} animateOpacity>
          <Box
            py={4}
            bg="yellow.300"
            borderTop="2px solid black"
            borderBottom="2px solid black"
            mb={2}
          >
            <Stack spacing={4}>
              <Link 
                as={RouterLink} 
                to="/"
                fontWeight="bold"
                fontSize="lg"
                px={2}
                py={2}
                _hover={{
                  bg: 'yellow.400',
                  textDecoration: 'none',
                }}
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link 
                  as={RouterLink} 
                  to="/blogs/create"
                  fontWeight="bold"
                  fontSize="lg"
                  px={2}
                  py={2}
                  _hover={{
                    bg: 'yellow.400',
                    textDecoration: 'none',
                  }}
                >
                  Create Blog
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  as={RouterLink} 
                  to="/dashboard"
                  fontWeight="bold"
                  fontSize="lg"
                  px={2}
                  py={2}
                  _hover={{
                    bg: 'yellow.400',
                    textDecoration: 'none',
                  }}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated ? (
                <Box
                  as="button"
                  onClick={handleLogout}
                  fontWeight="bold"
                  fontSize="lg"
                  px={2}
                  py={2}
                  color="accent.600"
                  _hover={{
                    bg: 'yellow.400',
                  }}
                >
                  Logout
                </Box>
              ) : (
                <>
                  <Link 
                    as={RouterLink} 
                    to="/login"
                    fontWeight="bold"
                    fontSize="lg"
                    px={2}
                    py={2}
                    _hover={{
                      bg: 'yellow.400',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link 
                    as={RouterLink} 
                    to="/register"
                    fontWeight="bold"
                    fontSize="lg"
                    px={2}
                    py={2}
                    _hover={{
                      bg: 'yellow.400',
                      textDecoration: 'none',
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Header; 