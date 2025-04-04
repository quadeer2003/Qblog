// Serverless function to handle user data requests and proxy them to the FastAPI backend
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
const meHandler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      console.log('Handling user data request');
      
      // Get the authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Missing or invalid authorization header');
        return res.status(401).json({ 
          detail: "Missing or invalid authorization token" 
        });
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      // For demonstration, we'll just return a dummy user
      // In a production environment, we would validate the token and fetch real user data
      console.log('User token received:', token);
      
      return res.status(200).json({
        id: "serverless-user-id",
        username: "serverless-user",
        email: "serverless@example.com",
        created_at: new Date().toISOString(),
        message: "User data retrieved through serverless function"
      });
    } catch (error) {
      console.error('User data error:', error.message);
      
      // Something went wrong
      return res.status(500).json({ 
        detail: "Internal server error", 
        message: error.message 
      });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ detail: "Method not allowed" });
  }
};

// Export with CORS wrapper
module.exports = allowCors(meHandler); 