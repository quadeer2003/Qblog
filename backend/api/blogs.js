// Serverless function to handle blog operations
const axios = require('axios');

// CORS middleware wrapper
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin'
  );
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled by wrapper');
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

// Generate a more robust set of sample blogs
const generateSampleBlogs = () => {
  const now = new Date();
  return [
    {
      id: "blog-1",
      title: "Getting Started with React",
      content: "This is a beginner's guide to React. React is a JavaScript library for building user interfaces, particularly single-page applications. It's used for handling the view layer in web and mobile apps. React allows us to create reusable UI components. It was first created by Jordan Walke, a software engineer at Facebook, and is now maintained by Facebook and a community of individual developers and companies.",
      tags: ["react", "javascript", "frontend"],
      author_id: "user-1",
      author_username: "serverless-user",
      created_at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "blog-2",
      title: "Advanced Python Techniques",
      content: "Discover advanced Python programming techniques. Python is a high-level, interpreted programming language known for its simplicity and readability. In this blog post, we explore advanced topics such as decorators, generators, context managers, and metaclasses. Understanding these concepts can help you write more efficient and elegant code.",
      tags: ["python", "programming", "backend"],
      author_id: "user-1",
      author_username: "serverless-user",
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "blog-3",
      title: "Introduction to FastAPI",
      content: "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints. This blog post covers the basics of setting up a FastAPI application, defining routes, handling request validation, and documentation.",
      tags: ["python", "fastapi", "backend", "api"],
      author_id: "user-2",
      author_username: "demo-user",
      created_at: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "blog-4",
      title: "Building a Blog with Chakra UI",
      content: "Chakra UI is a simple, modular and accessible component library that gives you the building blocks you need to build your React applications. This guide explores how to create a modern blog interface using Chakra UI components for a clean, responsive design.",
      tags: ["react", "chakra-ui", "design", "frontend"],
      author_id: "user-2",
      author_username: "demo-user",
      created_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "blog-5",
      title: "MongoDB for JavaScript Developers",
      content: "MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database, MongoDB uses JSON-like documents with optional schemas. This post covers how to integrate MongoDB with Node.js applications.",
      tags: ["mongodb", "database", "javascript", "backend"],
      author_id: "user-1",
      author_username: "serverless-user",
      created_at: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Sample blogs data
const sampleBlogs = generateSampleBlogs();

// Main handler function
const blogsHandler = async (req, res) => {
  console.log(`Handling blog request: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Query parameters:`, req.query);
  
  // Handle based on HTTP method
  if (req.method === 'GET') {
    try {
      // Check if it's a request for a specific blog
      const blogId = req.url.match(/\/api\/blogs\/([^\/\?]+)/)?.[1];
      
      if (blogId) {
        console.log(`Getting blog with ID: ${blogId}`);
        const blog = sampleBlogs.find(b => b.id === blogId);
        
        if (blog) {
          return res.status(200).json(blog);
        } else {
          return res.status(404).json({ detail: "Blog not found" });
        }
      }
      
      // Handle query parameters for listing blogs
      let filteredBlogs = [...sampleBlogs];
      
      // Filter by author_id if provided
      if (req.query.author_id) {
        console.log(`Filtering by author_id: ${req.query.author_id}`);
        filteredBlogs = filteredBlogs.filter(blog => 
          blog.author_id === req.query.author_id
        );
      }
      
      // Filter by tag if provided
      if (req.query.tag) {
        console.log(`Filtering by tag: ${req.query.tag}`);
        filteredBlogs = filteredBlogs.filter(blog => 
          blog.tags.includes(req.query.tag)
        );
      }
      
      // Simple pagination
      const skip = parseInt(req.query.skip) || 0;
      const limit = parseInt(req.query.limit) || 10;
      
      // Apply pagination
      const paginatedBlogs = filteredBlogs
        .slice(skip, skip + limit);
      
      console.log(`Returning ${paginatedBlogs.length} blogs`);
      return res.status(200).json(paginatedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error.message);
      return res.status(500).json({ detail: "Error fetching blogs", message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      // Check for auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: "Authentication required" });
      }
      
      // Get blog data from request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, content, tags = [] } = body;
      
      console.log('Received blog data:', body);
      
      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({ detail: "Title and content are required" });
      }
      
      // Create blog post (in a real app, this would save to database)
      const newBlog = {
        id: `blog-${Date.now()}`,
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        author_id: "user-1",
        author_username: "serverless-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Created new blog:', newBlog);
      
      // Push to sample blogs to simulate database adding
      sampleBlogs.unshift(newBlog);
      
      return res.status(201).json(newBlog);
    } catch (error) {
      console.error('Error creating blog:', error.message);
      return res.status(500).json({ detail: "Error creating blog", message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      // Get blog ID from URL
      const blogId = req.url.match(/\/api\/blogs\/([^\/\?]+)/)?.[1];
      
      if (!blogId) {
        return res.status(400).json({ detail: "Blog ID is required" });
      }
      
      // Check for auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: "Authentication required" });
      }
      
      // Get blog data from request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, content, tags } = body;
      
      // Find blog to update
      const blogIndex = sampleBlogs.findIndex(b => b.id === blogId);
      
      if (blogIndex === -1) {
        return res.status(404).json({ detail: "Blog not found" });
      }
      
      // Update blog
      const updatedBlog = {
        ...sampleBlogs[blogIndex],
        title: title || sampleBlogs[blogIndex].title,
        content: content || sampleBlogs[blogIndex].content,
        tags: tags || sampleBlogs[blogIndex].tags,
        updated_at: new Date().toISOString()
      };
      
      // Replace in array
      sampleBlogs[blogIndex] = updatedBlog;
      
      return res.status(200).json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog:', error.message);
      return res.status(500).json({ detail: "Error updating blog", message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Get blog ID from URL
      const blogId = req.url.match(/\/api\/blogs\/([^\/\?]+)/)?.[1];
      
      if (!blogId) {
        return res.status(400).json({ detail: "Blog ID is required" });
      }
      
      // Check for auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: "Authentication required" });
      }
      
      // Find blog index
      const blogIndex = sampleBlogs.findIndex(b => b.id === blogId);
      
      if (blogIndex === -1) {
        return res.status(404).json({ detail: "Blog not found" });
      }
      
      // Remove from array
      sampleBlogs.splice(blogIndex, 1);
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting blog:', error.message);
      return res.status(500).json({ detail: "Error deleting blog", message: error.message });
    }
  } else {
    return res.status(405).json({ detail: "Method not allowed" });
  }
};

// Export with CORS wrapper
module.exports = allowCors(blogsHandler); 