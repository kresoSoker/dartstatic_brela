import { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '90%'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
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