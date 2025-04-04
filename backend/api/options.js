// This is a serverless function to handle CORS preflight (OPTIONS) requests
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    // Return a 200 OK response for OPTIONS requests
    res.status(200).end();
    return;
  }

  // Redirect to the Python API for all other methods
  res.setHeader('Location', '/app/main.py' + req.url);
  res.status(307).end(); // Temporary redirect
}; 