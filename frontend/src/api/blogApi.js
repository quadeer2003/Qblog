import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL);

// Configure axios defaults for better CORS handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Set to true if you need cookies
});

// Add auth token to all requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Fallback fetch mechanism that doesn't set Origin header
const fallbackFetch = async (url, options = {}) => {
  try {
    console.log(`Using fallback fetch for: ${url}`);
    // Add auth token if available
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };
    
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fallback fetch error:', error);
    throw error;
  }
};

// Blog APIs
const blogApi = {
  // Get all blogs with optional filtering
  getBlogs: async (params = {}) => {
    try {
      console.log('Fetching blogs with params:', params);
      
      try {
        const response = await api.get(`/api/blogs`, { params });
        return response.data;
      } catch (error) {
        console.warn('Regular API call failed, trying fallback', error);
        
        // Build URL with query params
        const url = new URL(`${API_URL}/api/blogs`);
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
        
        return await fallbackFetch(url.toString(), { method: 'GET' });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get a single blog by ID
  getBlogById: async (id) => {
    try {
      try {
        const response = await api.get(`/api/blogs/${id}`);
        return response.data;
      } catch (error) {
        console.warn(`Regular API call failed, trying fallback for blog ${id}`, error);
        return await fallbackFetch(`${API_URL}/api/blogs/${id}`, { method: 'GET' });
      }
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  // Create a new blog
  createBlog: async (blogData) => {
    try {
      try {
        const response = await api.post(`/api/blogs`, blogData);
        return response.data;
      } catch (error) {
        console.warn('Regular API call failed, trying fallback for blog creation', error);
        
        return await fallbackFetch(`${API_URL}/api/blogs`, {
          method: 'POST',
          body: JSON.stringify(blogData)
        });
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update an existing blog
  updateBlog: async (id, blogData) => {
    try {
      try {
        const response = await api.put(`/api/blogs/${id}`, blogData);
        return response.data;
      } catch (error) {
        console.warn(`Regular API call failed, trying fallback for blog update ${id}`, error);
        
        return await fallbackFetch(`${API_URL}/api/blogs/${id}`, {
          method: 'PUT',
          body: JSON.stringify(blogData)
        });
      }
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
      throw error;
    }
  },

  // Delete a blog
  deleteBlog: async (id) => {
    try {
      try {
        await api.delete(`/api/blogs/${id}`);
        return true;
      } catch (error) {
        console.warn(`Regular API call failed, trying fallback for blog deletion ${id}`, error);
        
        await fallbackFetch(`${API_URL}/api/blogs/${id}`, {
          method: 'DELETE'
        });
        return true;
      }
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  },

  // Get user's blogs
  getUserBlogs: async (username) => {
    try {
      console.log(`Fetching blogs for user: ${username}`);
      
      try {
        // First get the user ID from username
        const usersResponse = await api.get(`/api/users`, { 
          params: { username: username } 
        });
        
        // If user exists, get their blogs
        if (usersResponse.data && usersResponse.data.length > 0) {
          const userId = usersResponse.data[0].id;
          console.log(`Found user ID: ${userId} for username: ${username}`);
          
          const response = await api.get(`/api/blogs`, { 
            params: { author_id: userId } 
          });
          return response.data;
        } else {
          console.error(`User not found with username: ${username}`);
          return [];
        }
      } catch (error) {
        console.warn(`Regular API call failed, trying fallback for user blogs of ${username}`, error);
        
        // For the fallback, we'll just return blogs directly since we have serverless functions 
        // that know the current user
        return await fallbackFetch(`${API_URL}/api/blogs`, {
          method: 'GET'
        });
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      throw error;
    }
  }
};

export default blogApi; 