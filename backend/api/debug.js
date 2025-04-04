// Serverless function for debugging API issues
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://qblog-nrzw.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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

const debugHandler = async (req, res) => {
  console.log('Debug handler called');
  
  // Only allow GET requests for security
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: "Method not allowed" });
  }
  
  // Collect diagnostic information
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    request: {
      url: req.url,
      method: req.method,
      headers: req.headers,
      query: req.query
    },
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      // Add any other relevant server info
    },
    // Include a simple connectivity test
    connectivity: {
      status: 'ok',
      message: 'API is reachable'
    }
  };
  
  return res.status(200).json(diagnostics);
};

module.exports = allowCors(debugHandler); 