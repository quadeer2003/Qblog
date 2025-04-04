// This is a serverless function to handle CORS preflight (OPTIONS) requests
module.exports = (req, res) => {
  console.log('CORS handler invoked:', req.method, req.url);
  
  // Always set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // For OPTIONS method, immediately return 200 OK without content
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request with 200 OK');
    res.status(200).end();
    return;
  }

  // For all other methods, this function should only handle /api paths
  console.log('Forwarding request to FastAPI backend');
  
  // Just end the response - we're relying on the next route in vercel.json
  // to actually handle passing to the FastAPI app
  res.status(200).json({ 
    message: "This is just a CORS handler. Request will be processed by the main API.",
    success: true
  });
}; 