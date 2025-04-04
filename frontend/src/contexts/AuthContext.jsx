import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Add auth token to requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
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
        const response = await axios.get('/api/auth/me');
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
      const response = await axios.post('/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log("Login response:", response.data);
      
      if (response?.data?.access_token) {
        const { access_token } = response.data;

        // Store token in localStorage and state
        localStorage.setItem('token', access_token);
        setToken(access_token);

        // Set auth header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        try {
          console.log("Fetching user data after login...");
          // Fetch user details
          const userResponse = await axios.get('/api/auth/me');
          
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
      const response = await axios.post('/api/auth/register', userData);
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