// Serverless function to handle user data requests and proxy them to the FastAPI backend
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
    console.log('OPTIONS request to /api/auth/me');
    res.status(200).end();
    return;
  }

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
      
      // In Vercel's environment, we use the current hostname for the internal API
      const INTERNAL_API_URL = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.INTERNAL_API_URL || 'http://localhost:8000';
      
      console.log(`Using internal API URL: ${INTERNAL_API_URL}`);
      
      // Make request to internal API
      const response = await axios.get(`${INTERNAL_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Internal-Request': 'true'
        }
      });
      
      console.log('User data retrieved successfully');
      
      // Return the response with user data
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('User data error:', error.message);
      
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