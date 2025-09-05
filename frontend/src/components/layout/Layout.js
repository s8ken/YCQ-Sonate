import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { mode, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box sx={{ flexGrow: 1 }}>
        <Header toggleDrawer={toggleDrawer}>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Header>
        <Box component="main" sx={{ p: 3, mt: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;