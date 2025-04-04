import { Box, Heading, Text, Flex, Badge, LinkBox, LinkOverlay, HStack, Avatar } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

const BlogCard = ({ blog }) => {
  const { id, title, content, tags, author_username, created_at } = blog;
  
  // Format date
  const formattedDate = format(new Date(created_at), 'MMM dd, yyyy');
  
  // Generate random pastel background
  const colorOptions = ['#FDEFE9', '#E2F0FE', '#ECFDF3', '#F2F0FF', '#FFF8E8', '#FCF0F4'];
  const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
  
  // Truncate content for preview
  const truncatedContent = content.length > 120 
    ? `${content.substring(0, 120)}...` 
    : content;

  // Get first letter of author name for avatar
  const avatarInitial = author_username ? author_username[0].toUpperCase() : '?';

  return (
    <LinkBox 
      as="article" 
      bg="white"
      border="3px solid black"
      boxShadow="5px 5px 0 black"
      borderRadius="0"
      transition="all 0.2s ease-in-out"
      _hover={{ 
        transform: 'translate(-3px, -3px)',
        boxShadow: '8px 8px 0 black',
      }}
      overflow="hidden"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Colorful header */}
      <Box 
        bg={randomColor} 
        p={6} 
        borderBottom="3px solid black"
      >
        <Heading 
          as="h3" 
          size="md" 
          mb={2}
          noOfLines={2}
        >
          <LinkOverlay as={RouterLink} to={`/blogs/${id}`}>
            {title}
          </LinkOverlay>
        </Heading>

        <HStack spacing={2} mb={4}>
          {tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              bg="black" 
              color="white" 
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="0"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge 
              bg="gray.200" 
              color="black" 
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="0"
            >
              +{tags.length - 3}
            </Badge>
          )}
        </HStack>
      </Box>

      {/* Content */}
      <Box p={6} flex="1">
        <Text 
          noOfLines={3} 
          mb={4} 
          fontSize="sm"
          color="gray.600"
        >
          {truncatedContent}
        </Text>
      </Box>

      {/* Footer with author info */}
      <Flex 
        borderTop="3px solid black" 
        p={4} 
        alignItems="center" 
        bg="gray.50"
      >
        <Avatar 
          name={author_username} 
          bg="black" 
          color="white" 
          size="sm" 
          mr={3}
          borderRadius="0"
          fontWeight="bold"
        >
          {avatarInitial}
        </Avatar>
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {author_username}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formattedDate}
          </Text>
        </Box>
      </Flex>
    </LinkBox>
  );
};

export default BlogCard; 