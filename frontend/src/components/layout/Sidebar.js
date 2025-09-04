import React, { useContext } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Typography,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import LinkIcon from '@mui/icons-material/Link';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useTheme } from '@mui/material/styles';

const Sidebar = ({ open, toggleDrawer }) => {
   const { user, logout } = useAuth();
   const { mode } = useContext(ThemeContext);
   const theme = useTheme();
   const location = useLocation();
  const menuItems = [
     { text: 'Dashboard', icon: <DashboardIcon />, path: '/', useTheme: 'primary' },
     { text: 'Conversations', icon: <ChatIcon />, path: '/conversations', color: '#10b981' },
     { text: 'Agents', icon: <SmartToyIcon />, path: '/agents', useTheme: 'primary' },
     { text: 'Assistants', icon: <SmartToyIcon />, path: '/assistants', useTheme: 'secondary' },
     { text: 'Symbi Logs', icon: <AssessmentIcon />, path: '/reports', color: '#f59e0b' },
     { text: 'Review Console', icon: <TimelineIcon />, path: '/review', color: '#0ea5e9' },
     { text: 'Context Bridge', icon: <LinkIcon />, path: '/context-bridge', color: '#3b82f6' },
     { text: 'Documentation', icon: <MenuBookIcon />, path: '/documentation', color: '#16a34a' },
     { text: 'Settings', icon: <SettingsIcon />, path: '/settings', color: '#6b7280' },
   ];

   const handleLogout = () => {
     logout();
     toggleDrawer();
   };

  if (!user) return null;

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={toggleDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 300,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          boxShadow: theme.shadows[2]
        },
      }}
    >
      <Box 
        sx={{ 
          p: 3,
          background: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative'
        }}
      >
        <Box>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontWeight: 700, 
              mb: 0.5,
              color: theme.palette.text.primary,
              letterSpacing: '-0.01em'
            }}
          >
            SYMBI SYNERGY
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontWeight: 500,
              color: theme.palette.text.secondary,
              mb: 2
            }}
          >
            Trust First Platform
          </Typography>
        </Box>
      </Box>
      
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          const itemColor = item.useTheme ? theme.palette[item.useTheme].main : item.color;
          return (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleDrawer}
              sx={{
                color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                background: isSelected ? theme.palette.primary.main : 'transparent',
                borderRadius: theme.shape.borderRadius,
                mb: 1,
                mx: 1,
                position: 'relative',
                '&:hover': {
                  background: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
                  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isSelected ? theme.palette.primary.contrastText : itemColor,
                  minWidth: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.25rem'
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiListItemText-primary': {
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary
                  }
                }}
              />

            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider 
          sx={{ 
            mb: 2,
            borderColor: theme.palette.divider
          }} 
        />
        
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: theme.shape.borderRadius,
            background: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
            mb: 1
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText
            }}
          >
            <PersonIcon sx={{ fontSize: '1.25rem' }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                fontWeight: 600, 
                mb: 0.5,
                color: theme.palette.text.primary
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: theme.typography.fontFamily,
                fontWeight: 400,
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              width: 36,
              height: 36,
              '&:hover': {
                bgcolor: theme.palette.error.dark
              },
              transition: 'all 0.2s ease'
            }}
          >
            <LogoutIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
