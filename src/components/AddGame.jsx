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
      player1Score: editGame.score ? editGame.score.split('-')[0].trim() : '',
      player2Score: editGame.score ? editGame.score.split('-')[1].trim() : ''
    } : {
      player1: '',
      player2: '',
      player1Score: '',
      player2Score: ''
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
      const p1 = gameData.player1;
      const p2 = gameData.player2;
      const s1 = parseInt(gameData.player1Score, 10);
      const s2 = parseInt(gameData.player2Score, 10);
      if (!p1 || !p2 || isNaN(s1) || isNaN(s2)) {
        alert('Please select both players and enter valid scores.');
        return;
      }
      if (p1 === p2) {
        alert('Players must be different.');
        return;
      }
      let winner = '';
      if (s1 > s2) winner = p1;
      else if (s2 > s1) winner = p2;
      else winner = ''; // Draws not allowed, or handle as needed
      if (!winner) {
        alert('Scores must not be equal. There must be a winner.');
        return;
      }
      const gamePayload = {
        ...(editGame && { id: editGame.id }),
        date: editGame ? editGame.date : new Date().toISOString(),
        createdAt: editGame ? editGame.createdAt : new Date().toISOString(),
        players: [p1, p2],
        winner,
        score: `${s1}-${s2}`,
        oneEighties: { [p1]: 0, [p2]: 0 },
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

    localStorage.setItem('playerStats', JSON.stringify(stats));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#fff !important', textAlign: 'center', mb: 2 }}>
        {editGame ? 'Izmjeni meć' : 'Dodaj meč'}
      </Typography>
      <Paper sx={{ p: 4, backgroundColor: '#fafbaa' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
              <FormControl sx={{ flex: 2 }} margin="normal" required>
                <InputLabel>Igrač 1</InputLabel>
                <Select
                  value={gameData.player1}
                  label="Igrač 1"
                  onChange={(e) => setGameData({ ...gameData, player1: e.target.value })}
                >
                  {players.map((player) => (
                    <MenuItem 
                      key={player} 
                      value={player}
                      disabled={player === gameData.player2}
                    >
                      {player}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={{ flex: 1, minWidth: 80 }}
                label="Rezultat igrača 1"
                type="number"
                value={gameData.player1Score}
                onChange={(e) => setGameData({ ...gameData, player1Score: e.target.value })}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
              <FormControl sx={{ flex: 2 }} margin="normal" required>
                <InputLabel>Igrač 2</InputLabel>
                <Select
                  value={gameData.player2}
                  label="Igrač 2"
                  onChange={(e) => setGameData({ ...gameData, player2: e.target.value })}
                >
                  {players.map((player) => (
                    <MenuItem 
                      key={player} 
                      value={player}
                      disabled={player === gameData.player1}
                    >
                      {player}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={{ flex: 1, minWidth: 80 }}
                label="Rezultat igrača 2"
                type="number"
                value={gameData.player2Score}
                onChange={(e) => setGameData({ ...gameData, player2Score: e.target.value })}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
            >
              {editGame ? 'Spremi meć' : 'Spremi meč'}
            </Button>
          </Box>
        </form>
        )}
      </Paper>
    </Box>
  );
}

export default AddGame;