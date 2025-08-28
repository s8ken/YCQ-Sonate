import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token for all requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        setToken(null);
        setError('Authentication failed. Please login again.');
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const userData = { name, email, password };
      const res = await axios.post('/api/auth/register', userData);
      setToken(res.data.data.token);
      setUser(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.data.token);
      setUser(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
