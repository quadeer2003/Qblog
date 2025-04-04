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
      
      // Use a more direct approach for FastAPI access
      // We'll use the fallback endpoint to avoid the proxy loop
      const response = await fetch(`https://${process.env.VERCEL_URL || 'localhost:8000'}/api/auth/fallback?mode=register&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Internal-Request': 'true'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }
      
      const data = await response.json();
      console.log('Registration successful', data);
      
      // Return the response
      return res.status(201).json(data);
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