// Serverless function to handle login requests and proxy them to the FastAPI backend
const axios = require('axios');
const querystring = require('querystring');

module.exports = async (req, res) => {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request to /api/auth/login');
    res.status(200).end();
    return;
  }

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
      
      // In Vercel's environment, we use the current hostname for the internal API
      const INTERNAL_API_URL = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.INTERNAL_API_URL || 'http://localhost:8000';
      
      console.log(`Using internal API URL: ${INTERNAL_API_URL}`);
      
      // Create form data for the FastAPI OAuth2 endpoint
      const formData = querystring.stringify({
        username,
        password
      });
      
      // Make request to internal API
      const response = await axios.post(`${INTERNAL_API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'X-Internal-Request': 'true'
        }
      });
      
      console.log('Login successful');
      
      // Return the response with access token
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Login error:', error.message);
      
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