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

// Simple proxy approach using a GET request when POST fails due to CORS
const registerFallback = async (userData) => {
  console.log('Trying fallback registration approach');
  
  // Encode the user data in the URL (not ideal but a workaround for CORS)
  const params = new URLSearchParams();
  params.append('username', userData.username);
  params.append('email', userData.email);
  params.append('password', userData.password);
  params.append('mode', 'register');
  
  try {
    // This assumes you've set up a special GET endpoint on your server
    // that can handle registration requests via GET for CORS fallback
    const response = await fetch(`${API_URL}/api/auth/fallback?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://qblog-nrzw.vercel.app'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fallback registration failed:', error);
    throw error;
  }
};

// Similar fallback for login
const loginFallback = async (email, password) => {
  console.log('Trying fallback login approach');
  
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  params.append('mode', 'login');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/fallback?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://qblog-nrzw.vercel.app'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fallback login failed:', error);
    throw error;
  }
};

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
        
        // First try with axios 
        let userData = null;
        try {
          const response = await api.get('/api/auth/me');
          userData = response.data;
        } catch (error) {
          console.warn('Regular API call failed, trying fallback', error);
          
          // If axios fails, try with fetch (sometimes has better CORS handling)
          const fallbackResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Origin': 'https://qblog-nrzw.vercel.app'
            }
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch user: ${fallbackResponse.status}`);
          }
          
          userData = await fallbackResponse.json();
        }
        
        console.log('User data response:', userData);
        
        // Ensure we have the user ID properly set
        if (userData && userData.id) {
          setUser(userData);
        } else {
          console.error('Missing user ID in response', userData);
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
      let response;
      
      try {
        // First try with axios
        response = await api.post('/api/auth/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Origin': 'https://qblog-nrzw.vercel.app'
          }
        });
      } catch (error) {
        console.warn('Regular login failed, trying fallback', error);
        
        // If axios fails, try fallback
        const fallbackData = await loginFallback(email, password);
        response = { data: fallbackData };
      }
      
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
          let userResponse;
          
          try {
            userResponse = await api.get('/api/auth/me');
          } catch (error) {
            console.warn('Regular user fetch failed, trying fallback', error);
            
            // If axios fails, try with fetch
            const fallbackResponse = await fetch(`${API_URL}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Origin': 'https://qblog-nrzw.vercel.app'
              }
            });
            
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to fetch user: ${fallbackResponse.status}`);
            }
            
            userResponse = { data: await fallbackResponse.json() };
          }
          
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
      
      let response;
      
      try {
        // First try with axios
        response = await api.post('/api/auth/register', userData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://qblog-nrzw.vercel.app'
          }
        });
      } catch (error) {
        console.warn('Regular registration failed, trying fallback', error);
        
        // If axios fails, try fallback
        const fallbackData = await registerFallback(userData);
        response = { data: fallbackData };
      }
      
      console.log("Registration successful:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Registration error details:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Registration failed' 
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