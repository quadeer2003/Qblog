// Serverless function to handle login requests and proxy them to the FastAPI backend
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
const loginHandler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      console.log('Handling login request');
      
      // FastAPI expects form data for OAuth login
      let username, password;
      
      // Check if the data is coming as JSON or form-urlencoded
      if (req.headers['content-type']?.includes('application/json')) {
        // Handle JSON data
        const { username: u, password: p } = req.body;
        username = u;
        password = p;
      } else {
        // Handle form data
        username = req.body.username;
        password = req.body.password;
      }
      
      // Validate request
      if (!username || !password) {
        console.error('Missing required fields');
        return res.status(400).json({ 
          detail: "Missing required fields. Both username and password are required." 
        });
      }
      
      console.log(`Login attempt for: ${username}`);
      
      // Use the fallback endpoint to avoid proxy loops
      const response = await fetch(`https://${process.env.VERCEL_URL || 'localhost:8000'}/api/auth/fallback?mode=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
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
      console.log('Login successful');
      
      // Return the response with access token
      return res.status(200).json(data);
    } catch (error) {
      console.error('Login error:', error.message);
      
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
module.exports = allowCors(loginHandler); 