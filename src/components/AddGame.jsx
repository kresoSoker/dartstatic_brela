import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../services/api';

function AddGame({ username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editGame = location.state?.editGame;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [gameData, setGameData] = useState(
    editGame ? {
      player1: editGame.players[0],
      player2: editGame.players[1],
      winner: editGame.winner,
      score: editGame.score,
      player1OneEighties: editGame.oneEighties[editGame.players[0]] || '0',
      player2OneEighties: editGame.oneEighties[editGame.players[1]] || '0'
    } : {
      player1: '',
      player2: '',
      winner: '',
      score: '',
      player1OneEighties: '0',
      player2OneEighties: '0'
    }
  );

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const allowedPlayers = await api.getAllowedPlayers();
        setPlayers(allowedPlayers);
      } catch (error) {
        console.error('Error loading players:', error);
        setError('Failed to load players. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const gamePayload = {
        ...(editGame && { id: editGame.id }), // Preserve the original ID if editing
        date: editGame ? editGame.date : new Date().toISOString(),
        createdAt: editGame ? editGame.createdAt : new Date().toISOString(),
        players: [gameData.player1, gameData.player2],
        winner: gameData.winner,
        score: gameData.score,
        oneEighties: {
          [gameData.player1]: parseInt(gameData.player1OneEighties) || 0,
          [gameData.player2]: parseInt(gameData.player2OneEighties) || 0
        },
        addedBy: editGame ? editGame.addedBy : username
      };

      if (editGame) {
        await api.updateGame(editGame.id, gamePayload);
      } else {
        await api.addGame(gamePayload);
      }
      navigate('/games');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Failed to ${editGame ? 'update' : 'add'} game: ${errorMessage}`);
      console.error('Error:', error);
    }
  };

  const updatePlayerStats = (game) => {
    const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    
    // Update winner stats
    if (!stats[game.winner]) {
      stats[game.winner] = { wins: 0, losses: 0, oneEighties: 0 };
    }
    stats[game.winner].wins += 1;
    
    // Update loser stats
    const loser = game.players.find(player => player !== game.winner);
    if (!stats[loser]) {
      stats[loser] = { wins: 0, losses: 0, oneEighties: 0 };
    }
    stats[loser].losses += 1;
    
    // Update 180s
    if (game.oneEighties > 0) {
      stats[game.winner].oneEighties += game.oneEighties;
    }

    localStorage.setItem('playerStats', JSON.stringify(stats));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {editGame ? 'Edit Game' : 'Add New Game'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Player 1</InputLabel>
            <Select
              value={gameData.player1}
              label="Player 1"
              onChange={(e) => setGameData({ 
                ...gameData, 
                player1: e.target.value,
                // Reset winner if it was player1
                winner: gameData.winner === gameData.player1 ? '' : gameData.winner
              })}
            >
              {players.map((player) => (
                <MenuItem 
                  key={player} 
                  value={player}
                  disabled={player === gameData.player2} // Prevent selecting same player
                >
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Player 2</InputLabel>
            <Select
              value={gameData.player2}
              label="Player 2"
              onChange={(e) => setGameData({ 
                ...gameData, 
                player2: e.target.value,
                // Reset winner if it was player2
                winner: gameData.winner === gameData.player2 ? '' : gameData.winner
              })}
            >
              {players.map((player) => (
                <MenuItem 
                  key={player} 
                  value={player}
                  disabled={player === gameData.player1} // Prevent selecting same player
                >
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Winner</InputLabel>
            <Select
              value={gameData.winner}
              onChange={(e) => setGameData({ ...gameData, winner: e.target.value })}
              label="Winner"
            >
              {gameData.player1 && (
                <MenuItem value={gameData.player1}>{gameData.player1}</MenuItem>
              )}
              {gameData.player2 && (
                <MenuItem value={gameData.player2}>{gameData.player2}</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Score"
            value={gameData.score}
            onChange={(e) => setGameData({ ...gameData, score: e.target.value })}
            margin="normal"
            required
            placeholder="e.g., 3-2"
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label={`${gameData.player1}'s 180s`}
              type="number"
              value={gameData.player1OneEighties}
              onChange={(e) => setGameData({ ...gameData, player1OneEighties: e.target.value })}
              margin="normal"
              inputProps={{ min: 0 }}
              disabled={!gameData.player1}
            />
            <TextField
              fullWidth
              label={`${gameData.player2}'s 180s`}
              type="number"
              value={gameData.player2OneEighties}
              onChange={(e) => setGameData({ ...gameData, player2OneEighties: e.target.value })}
              margin="normal"
              inputProps={{ min: 0 }}
              disabled={!gameData.player2}
            />
          </Box>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
          >
            {editGame ? 'Save Changes' : 'Add Game'}
          </Button>
        </form>
        )}
      </Paper>
    </Box>
  );
}

export default AddGame;