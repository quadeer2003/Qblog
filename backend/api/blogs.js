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

// Main handler function
const blogsHandler = async (req, res) => {
  console.log(`Handling blog request: ${req.method}`);
  
  // Handle based on HTTP method
  if (req.method === 'GET') {
    try {
      // Return some dummy blog posts
      return res.status(200).json([
        {
          id: "blog-1",
          title: "Getting Started with React",
          content: "This is a beginner's guide to React...",
          tags: ["react", "javascript", "frontend"],
          author_id: "serverless-user-id",
          author_username: "serverless-user",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "blog-2",
          title: "Advanced Python Techniques",
          content: "Discover advanced Python programming techniques...",
          tags: ["python", "programming", "backend"],
          author_id: "serverless-user-id",
          author_username: "serverless-user",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
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
      const { title, content, tags = [] } = req.body;
      
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
        author_id: "serverless-user-id",
        author_username: "serverless-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Created new blog:', newBlog);
      
      return res.status(201).json(newBlog);
    } catch (error) {
      console.error('Error creating blog:', error.message);
      return res.status(500).json({ detail: "Error creating blog", message: error.message });
    }
  } else if (req.method === 'PUT') {
    // Handle blog update
    return res.status(200).json({ message: "Blog update would happen here" });
  } else if (req.method === 'DELETE') {
    // Handle blog deletion
    return res.status(204).end();
  } else {
    return res.status(405).json({ detail: "Method not allowed" });
  }
};

// Export with CORS wrapper
module.exports = allowCors(blogsHandler); 