import { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import logo from '../assets/logo.png';
import version from '../../version.json';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const allowedUsers = {
    'kresimir.b': 'kreso261010',
    'karlo.m': 'km3698',
    'marino.j': 'mj2558',
    'frane.g': 'fg9663',
    'ante.c': 'ac0899',
    'dalibor.m': 'dm1123',
    'kruno.u': 'ku6589',
    'danijel.m': 'dm7896',
    'nikola.z': 'nz8855',
    'Josip': 'jj9990'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (username && password) {
      if (allowedUsers[username] === password) {
        onLogin(username);
      } else {
        setError('Invalid username or password');
      }
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} autoComplete="on">
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select your username</InputLabel>
            <Select
              value={username}
              label="Select your username"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            >
              {Object.keys(allowedUsers).map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            inputProps={{
              name: 'password'
            }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
          >
            Enter
          </Button>
        </form>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#666' }}>
          v{version.version}
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;