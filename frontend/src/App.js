import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Layout components
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ContextBridge from './pages/ContextBridge';
import NotFound from './pages/NotFound';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes - wrapped in Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/conversations" element={
        <ProtectedRoute>
          <Layout>
            <Conversations />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/conversations/:id" element={
        <ProtectedRoute>
          <Layout>
            <ConversationDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/agents" element={
        <ProtectedRoute>
          <Layout>
            <Agents />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/agents/:id" element={
        <ProtectedRoute>
          <Layout>
            <AgentDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/context-bridge" element={
        <ProtectedRoute>
          <Layout>
            <ContextBridge />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
