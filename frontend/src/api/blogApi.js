import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Blog APIs
const blogApi = {
  // Get all blogs with optional filtering
  getBlogs: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/blogs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get a single blog by ID
  getBlogById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  // Create a new blog
  createBlog: async (blogData) => {
    try {
      const response = await axios.post(`${API_URL}/blogs`, blogData);
      return response.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update an existing blog
  updateBlog: async (id, blogData) => {
    try {
      const response = await axios.put(`${API_URL}/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
      throw error;
    }
  },

  // Delete a blog
  deleteBlog: async (id) => {
    try {
      await axios.delete(`${API_URL}/blogs/${id}`);
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
      const usersResponse = await axios.get(`${API_URL}/users`, { 
        params: { username: username } 
      });
      
      // If user exists, get their blogs
      if (usersResponse.data && usersResponse.data.length > 0) {
        const userId = usersResponse.data[0].id;
        console.log(`Found user ID: ${userId} for username: ${username}`);
        
        const response = await axios.get(`${API_URL}/blogs`, { 
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