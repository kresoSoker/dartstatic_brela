import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import version from '../../version.json';

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
    { path: '/games', label: 'Mečevi' },
    { path: '/add-game', label: 'Dodaj meč' },
    { path: '/statistics', label: 'Statistika' },
    { path: '/player-statistics', label: 'Pojedinačni omjeri' }
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        minHeight: { xs: 56, sm: 64 },
        width: '100vw',
        left: 0,
        right: 0,
        background: '#d0be19',
        boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
        borderBottom: '1px solid #111301',
        zIndex: 1201,
      }}
    >
      <Toolbar
        sx={{
          flexWrap: 'nowrap',
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          boxSizing: 'border-box',
          width: '100%',
          alignItems: 'center',
        }}
      >
        {/* Logo/Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img src={logo} alt="Logo" style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 8, background: '#fff', objectFit: 'cover' }} />
        </Box>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: isMobile ? 1 : 0,
            mr: isMobile ? 0 : 4,
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: 600,
            letterSpacing: 0.5,
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}
        >
          Dobrodošao {username}
        </Typography>
        {!isMobile && (
          <Typography 
            variant="caption" 
            sx={{ 
              mr: 2, 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '0.75rem' 
            }}
          >
            v{version.version}
          </Typography>
        )}

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
              aria-label="open navigation menu"
              size="large"
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { minWidth: 180 } }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                  sx={{ fontWeight: isActive(item.path) ? 600 : 400 }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem onClick={onLogout} sx={{ color: '#d32f2f', fontWeight: 600 }}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 400,
                    whiteSpace: 'nowrap',
                    borderRadius: 2,
                    px: 2,
                    color: '#fff !important',
                    background: isActive(item.path)
                      ? 'rgba(255,255,255,0.12)'
                      : 'transparent',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.18)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Button color="inherit" onClick={onLogout} sx={{ ml: 2, color: '#fff', fontWeight: 600 }}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;