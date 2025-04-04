import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create a consistent axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('Auth API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://qblog-nrzw.vercel.app'
  },
  withCredentials: false // Set to true if you need cookies
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Auth API Error:', error);
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

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // Add auth token to requests if available
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user data with token');
        const response = await api.get('/api/auth/me');
        console.log('User data response:', response.data);
        
        // Ensure we have the user ID properly set
        if (response.data && response.data.id) {
          setUser(response.data);
        } else {
          console.error('Missing user ID in response', response.data);
          throw new Error('Invalid user data received');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        console.error('Error details:', error.response?.data);
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email });
      
      // Use URLSearchParams for better compatibility with FastAPI
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      console.log("Sending login request...");
      const response = await api.post('/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Origin': 'https://qblog-nrzw.vercel.app'
        }
      });
      
      console.log("Login response:", response.data);
      
      if (response?.data?.access_token) {
        const { access_token } = response.data;

        // Store token in localStorage and state
        localStorage.setItem('token', access_token);
        setToken(access_token);

        // Set auth header for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        try {
          console.log("Fetching user data after login...");
          // Fetch user details
          const userResponse = await api.get('/api/auth/me');
          
          console.log("User data response:", userResponse.data);
          if (userResponse?.data?.id) {
            setUser(userResponse.data);
            return true;
          } else {
            console.error('Invalid user data received after login', userResponse.data);
            return false;
          }
        } catch (userError) {
          console.error('Error fetching user details:', userError);
          console.error('Error details:', userError.response?.data);
          return false;
        }
      } else {
        console.error('Missing access token in login response', response.data);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Login error details:', error.response?.data);
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      console.log("Attempting registration with:", { username, email });
      
      // Create user data object matching the backend's expected format
      const userData = {
        username: username,
        email: email,
        password: password
      };
      
      console.log("Sending registration data:", userData);
      const response = await api.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://qblog-nrzw.vercel.app'
        }
      });
      console.log("Registration successful:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Registration error details:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 