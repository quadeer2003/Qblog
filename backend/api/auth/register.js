// Serverless function to handle registration requests and proxy them to the FastAPI backend
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
const registerHandler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      console.log('Handling registration request');
      
      // Get request body
      const { username, email, password } = req.body;
      
      // Validate request
      if (!username || !email || !password) {
        console.error('Missing required fields');
        return res.status(400).json({ 
          detail: "Missing required fields. All of username, email, and password are required." 
        });
      }
      
      console.log(`Registration attempt for email: ${email}`);
      
      // For demonstration, we'll just return a success response
      // In a production environment, we would connect to the database
      // and handle the actual registration logic
      
      return res.status(201).json({
        id: "serverless-user-id",
        username,
        email,
        created_at: new Date().toISOString(),
        message: "User registered through serverless function"
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      
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
module.exports = allowCors(registerHandler); 