// Serverless function to handle registration requests and proxy them to the FastAPI backend
const axios = require('axios');

module.exports = async (req, res) => {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request to /api/auth/register');
    res.status(200).end();
    return;
  }

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
      
      // Fix for Vercel deployment - avoid infinite loop by not using self-reference
      // Instead manually construct the API URL to the Python app
      const host = process.env.VERCEL_URL || 'localhost:8000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const INTERNAL_API_URL = `${protocol}://${host}`;
      
      console.log(`Using internal API URL: ${INTERNAL_API_URL}`);
      
      // Make direct request to the FastAPI app, bypassing the Node.js proxy
      const response = await axios.post(`${INTERNAL_API_URL}/app/main.py/api/auth/register`, {
        username,
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Important: Skip CORS checks for internal requests
          'X-Internal-Request': 'true'
        }
      });
      
      console.log('Registration successful', response.data);
      
      // Return the response
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Registration error:', error.message);
      
      // Handle API errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        return res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return res.status(503).json({ detail: "Backend service unavailable" });
      } 
      
      // Something else went wrong
      return res.status(500).json({ detail: "Internal server error", message: error.message });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ detail: "Method not allowed" });
  }
}; 