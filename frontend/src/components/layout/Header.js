import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, Divider, Switch, Box, useMediaQuery, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const Header = ({ toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/settings');
    handleClose();
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        {user && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          SYMBI Synergy
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Theme toggle */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {user ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/conversations"
                sx={{ display: isMobile ? 'none' : 'block' }}
              >
                Conversations
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/agents"
                sx={{ display: isMobile ? 'none' : 'block' }}
              >
                Agents
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/reports"
                sx={{ display: isMobile ? 'none' : 'block' }}
              >
                Symbi Logs
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/context-bridge"
                sx={{ display: isMobile ? 'none' : 'block' }}
              >
                Context Bridge
              </Button>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>Profile & Settings</MenuItem>
                <MenuItem component={Link} to="/reports" onClick={handleClose}>Symbi Logs</MenuItem>
                <MenuItem component={Link} to="/context-bridge" onClick={handleClose}>Context Bridge</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;