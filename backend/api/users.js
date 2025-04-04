// Serverless function to handle user operations
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
const usersHandler = async (req, res) => {
  console.log(`Handling user request: ${req.method}`);
  
  // Only handle GET requests
  if (req.method === 'GET') {
    try {
      // Check if the request is for a specific user or a list of users
      const { username } = req.query;
      const userId = req.url.match(/\/api\/users\/([^\/]+)/)?.[1];
      
      if (userId) {
        // Return a specific user
        return res.status(200).json({
          id: userId,
          username: "user_" + userId,
          email: `user_${userId}@example.com`,
          created_at: new Date().toISOString()
        });
      } else if (username) {
        // Return users filtered by username
        console.log(`Filtering users by username: ${username}`);
        return res.status(200).json([
          {
            id: "user-1",
            username: username,
            email: `${username}@example.com`,
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        // Return a list of dummy users
        return res.status(200).json([
          {
            id: "user-1",
            username: "serverless-user",
            email: "serverless@example.com",
            created_at: new Date().toISOString()
          },
          {
            id: "user-2",
            username: "demo-user",
            email: "demo@example.com",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return res.status(500).json({ detail: "Error fetching users", message: error.message });
    }
  } else {
    // Method not allowed for other HTTP methods
    return res.status(405).json({ detail: "Method not allowed" });
  }
};

// Export with CORS wrapper
module.exports = allowCors(usersHandler); 