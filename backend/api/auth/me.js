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
      
      // Direct access to the primary FastAPI endpoint
      // We access it directly to avoid potential routing loops
      const response = await fetch(`https://${process.env.VERCEL_URL || 'localhost:8000'}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Internal-Request': 'true'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }
      
      const data = await response.json();
      console.log('User data retrieved successfully');
      
      // Return the response with user data
      return res.status(200).json(data);
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