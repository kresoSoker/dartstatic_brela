import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';

function Navigation({ username, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);

  const isActive = (path) => location.pathname === path;
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const navigationItems = [
    { path: '/games', label: 'Games' },
    { path: '/add-game', label: 'Add Game' },
    { path: '/statistics', label: 'Statistics' },
    { path: '/player-statistics', label: 'Player vs Player' }
  ];

  return (
    <AppBar position="static">
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: isMobile ? 1 : 0,
            mr: isMobile ? 0 : 4,
            fontSize: isMobile ? '0.9rem' : '1.25rem'
          }}
        >
          Welcome, {username}
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {navigationItems.map((item) => (
                <MenuItem 
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem onClick={onLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    fontWeight: isActive(item.path) ? 'bold' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;