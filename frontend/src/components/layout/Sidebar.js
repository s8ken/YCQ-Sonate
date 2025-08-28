import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LinkIcon from '@mui/icons-material/Link';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const Sidebar = ({ open, toggleDrawer }) => {
  const { user } = useContext(AuthContext);
  const { mode } = useContext(ThemeContext);
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Conversations', icon: <ChatIcon />, path: '/conversations' },
    { text: 'Agents', icon: <SmartToyIcon />, path: '/agents' },
    { text: 'Symbi Logs', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Context Bridge', icon: <LinkIcon />, path: '/context-bridge' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  if (!user) return null;

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={toggleDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 240,
          boxSizing: 'border-box',
          bgcolor: mode === 'dark' ? 'background.paper' : 'background.default',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          SYMBI Synergy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AI Agent Platform
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={toggleDrawer}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {user?.name || 'User'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;