import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
  },
  colors: {
    brand: {
      50: '#f2f7ff',
      100: '#d9e5ff',
      200: '#c0d0ff',
      300: '#a8b9ff',
      400: '#8f9aff',
      500: '#767bff',
      600: '#5d5df9',
      700: '#4444e0',
      800: '#2b2bb8',
      900: '#121290',
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    success: {
      500: '#10b981',
    },
    warning: {
      500: '#f59e0b',
    },
    error: {
      500: '#ef4444',
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: '0',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          boxShadow: '4px 4px 0 black',
          border: '2px solid black',
          _hover: {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 black',
          },
          _active: {
            transform: 'translate(0px, 0px)',
            boxShadow: '2px 2px 0 black',
          },
        },
        secondary: {
          bg: 'white',
          color: 'black',
          boxShadow: '4px 4px 0 black',
          border: '2px solid black',
          _hover: {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 black',
          },
          _active: {
            transform: 'translate(0px, 0px)',
            boxShadow: '2px 2px 0 black',
          },
        },
        danger: {
          bg: 'accent.500',
          color: 'white',
          boxShadow: '4px 4px 0 black',
          border: '2px solid black',
          _hover: {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 black',
          },
          _active: {
            transform: 'translate(0px, 0px)',
            boxShadow: '2px 2px 0 black',
          },
        },
      },
      defaultProps: {
        variant: 'primary',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '0',
            border: '2px solid black',
            boxShadow: '4px 4px 0 black',
            background: 'white',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '4px 4px 0 black',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Textarea: {
      variants: {
        outline: {
          border: '2px solid black',
          boxShadow: '4px 4px 0 black',
          borderRadius: '0',
          background: 'white',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '4px 4px 0 black',
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '0',
          border: '2px solid black',
          boxShadow: '5px 5px 0 black',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translate(-2px, -2px)',
            boxShadow: '7px 7px 0 black',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: '0',
        textTransform: 'uppercase',
        fontWeight: 'bold',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          border: '1px solid black',
        },
      },
    },
    Box: {
      variants: {
        card: {
          border: '2px solid black',
          boxShadow: '5px 5px 0 black',
          borderRadius: '0',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translate(-2px, -2px)',
            boxShadow: '7px 7px 0 black',
          },
        },
      },
    },
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        width: '100%',
        mx: 'auto',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: '#f5f5f5',
        color: 'black',
      },
    },
  },
});

export default theme; 