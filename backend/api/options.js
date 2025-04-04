// This is a serverless function to handle CORS preflight (OPTIONS) requests

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
const optionsHandler = (req, res) => {
  console.log('CORS handler invoked for path:', req.url);
  
  // For all other methods, this function should only handle /api paths
  console.log('Forwarding request to FastAPI backend');
  
  // Just return with success - the wrapper has already handled OPTIONS requests
  res.status(200).json({ 
    message: "Options request handled successfully",
    success: true
  });
};

// Export with CORS wrapper
module.exports = allowCors(optionsHandler); 