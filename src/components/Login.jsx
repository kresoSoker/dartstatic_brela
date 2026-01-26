import { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import logo from '../assets/logo.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const allowedUsers = [
    'kresimir.b',
    'karlo.m',
    'marino.j',
    'frane.g',
    'ante.c',
    'dalibor.m',
    'kruno.u',
    'danijel.m'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (username) {
      onLogin(username);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: 0
        }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: 500,
          width: '90%',
          backgroundColor: '#fafbaa',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #d0be19'
            }} 
          />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ fontWeight: 600, color: '#111301' }}>
          Dart Statistics
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select your username</InputLabel>
            <Select
              value={username}
              label="Select your username"
              onChange={(e) => setUsername(e.target.value)}
            >
              {allowedUsers.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
            disabled={!username.trim()}
          >
            Enter
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;