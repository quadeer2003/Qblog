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

// Blog APIs
const blogApi = {
  // Get all blogs with optional filtering
  getBlogs: async (params = {}) => {
    try {
      const response = await api.get(`/api/blogs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get a single blog by ID
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/api/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  // Create a new blog
  createBlog: async (blogData) => {
    try {
      const response = await api.post(`/api/blogs`, blogData);
      return response.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update an existing blog
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/api/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
      throw error;
    }
  },

  // Delete a blog
  deleteBlog: async (id) => {
    try {
      await api.delete(`/api/blogs/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  },

  // Get user's blogs
  getUserBlogs: async (username) => {
    try {
      console.log(`Fetching blogs for user: ${username}`);
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
      console.error('Error fetching user blogs:', error);
      throw error;
    }
  }
};

export default blogApi; 