import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function Navigation({ username, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Welcome, {username}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/games')}
            sx={{ mr: 2, fontWeight: isActive('/games') ? 'bold' : 'normal' }}
          >
            Games
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/add-game')}
            sx={{ mr: 2, fontWeight: isActive('/add-game') ? 'bold' : 'normal' }}
          >
            Add Game
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/statistics')}
            sx={{ mr: 2, fontWeight: isActive('/statistics') ? 'bold' : 'normal' }}
          >
            Statistics
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/player-statistics')}
            sx={{ fontWeight: isActive('/player-statistics') ? 'bold' : 'normal' }}
          >
            Player vs Player
          </Button>
        </Box>
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;