import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pinExists, setPinExists] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      const response = await authAPI.checkPIN();
      setPinExists(response.data.exists);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const initializePIN = async (pin) => {
    try {
      await authAPI.initializePIN(pin);
      setPinExists(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to initialize PIN' };
    }
  };

  const login = async (pin) => {
    try {
      const response = await authAPI.verifyPIN(pin);
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Invalid PIN' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, pinExists, loading, initializePIN, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
