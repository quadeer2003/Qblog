import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Debug functions to help troubleshoot API issues
const debugApi = {
  // Get API diagnostics
  getDiagnostics: async () => {
    try {
      console.log('Requesting API diagnostics');
      
      try {
        const response = await axios.get(`${API_URL}/api/debug`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        return response.data;
      } catch (error) {
        console.warn('Regular diagnostics call failed, trying fetch', error);
        
        const response = await fetch(`${API_URL}/api/debug`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Diagnostics request failed with status ${response.status}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting diagnostics:', error);
      throw error;
    }
  },
  
  // Test blog API connectivity
  testBlogApi: async () => {
    try {
      console.log('Testing blog API connectivity');
      
      const results = {
        timestamp: new Date().toISOString(),
        tests: []
      };
      
      // Test 1: GET /api/blogs
      try {
        console.log('Test 1: GET /api/blogs');
        const start = Date.now();
        const response = await fetch(`${API_URL}/api/blogs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const timeMs = Date.now() - start;
        
        if (response.ok) {
          const data = await response.json();
          results.tests.push({
            name: 'GET /api/blogs',
            success: true,
            status: response.status,
            timeMs,
            blogCount: Array.isArray(data) ? data.length : 'N/A',
            message: 'Successfully retrieved blogs'
          });
        } else {
          results.tests.push({
            name: 'GET /api/blogs',
            success: false,
            status: response.status,
            timeMs,
            message: `Failed with status ${response.status}`
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'GET /api/blogs',
          success: false,
          error: error.message,
          message: 'Request failed with error'
        });
      }
      
      // Test 2: OPTIONS /api/blogs (CORS preflight)
      try {
        console.log('Test 2: OPTIONS /api/blogs');
        const response = await fetch(`${API_URL}/api/blogs`, {
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        
        results.tests.push({
          name: 'OPTIONS /api/blogs',
          success: response.ok,
          status: response.status,
          headers: {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers')
          },
          message: response.ok ? 'CORS preflight successful' : 'CORS preflight failed'
        });
      } catch (error) {
        results.tests.push({
          name: 'OPTIONS /api/blogs',
          success: false,
          error: error.message,
          message: 'CORS preflight request failed with error'
        });
      }
      
      // Test 3: Check localStorage for authentication token
      const token = localStorage.getItem('token');
      results.tests.push({
        name: 'Auth Token Check',
        success: !!token,
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        message: token ? 'Authentication token found' : 'No authentication token in localStorage'
      });
      
      // Test 4: Access debug API directly
      try {
        console.log('Test 4: GET /api/debug');
        const start = Date.now();
        const response = await fetch(`${API_URL}/api/debug`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const timeMs = Date.now() - start;
        
        if (response.ok) {
          results.tests.push({
            name: 'GET /api/debug',
            success: true,
            status: response.status,
            timeMs,
            message: 'Successfully connected to debug API'
          });
        } else {
          results.tests.push({
            name: 'GET /api/debug',
            success: false,
            status: response.status,
            timeMs,
            message: `Failed with status ${response.status}`
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'GET /api/debug',
          success: false,
          error: error.message,
          message: 'Debug request failed with error'
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error running API tests:', error);
      throw error;
    }
  },
  
  // Get client-side environment info
  getClientInfo: () => {
    return {
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      apiUrl: API_URL,
      localStorage: {
        token: !!localStorage.getItem('token'),
        user: !!localStorage.getItem('user')
      },
      cookies: document.cookie.length > 0
    };
  }
};

export default debugApi; 