import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider, useTheme } from './context/ThemeContext';
import { VariantProvider } from './context/VariantContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/guards/ProtectedRoute';
import ConversationGuard from './components/guards/ConversationGuard';

import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import ReviewConsole from './pages/ReviewConsole';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Assistants from './pages/Assistants';
import AssistantDetail from './pages/AssistantDetail';
import ContextBridge from './pages/ContextBridge';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route
                      path="/conversations/:id"
                      element={
                        <ConversationGuard>
                          <ConversationDetail />
                        </ConversationGuard>
                      }
                    />
                    <Route path="/review" element={<ReviewConsole />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agents/:id" element={<AgentDetail />} />
                    <Route path="/assistants" element={<Assistants />} />
                    <Route path="/assistants/:id" element={<AssistantDetail />} />
                    <Route path="/context-bridge" element={<ContextBridge />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <VariantProvider>
          <AppContent />
        </VariantProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
};

export default App;
