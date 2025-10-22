import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Button,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function Games() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await api.getGames();
        setGames(gamesData);
      } catch (err) {
        setError('Failed to load games. Please try again later.');
      }
    };
    fetchGames();
  }, []);

  const handleEdit = (game) => {
    navigate('/add-game', { state: { editGame: game } });
  };

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Game History
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete all games? This cannot be undone.')) {
              try {
                console.log('Attempting to reset data...');
                const result = await api.resetData();
                console.log('Reset result:', result);
                setGames([]);
                setError(null);
              } catch (error) {
                console.error('Reset error:', error);
                setError('Failed to reset data: ' + (error.response?.data?.error || error.message));
              }
            }
          }}
        >
          Reset All Data
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>180s</TableCell>
              <TableCell>Added By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                <TableCell>{game.players.join(' vs ')}</TableCell>
                <TableCell>{game.winner}</TableCell>
                <TableCell>{game.score}</TableCell>
                <TableCell>
                  {game.players.map(player => 
                    `${player}: ${game.oneEighties[player] || 0}`
                  ).join(', ')}
                </TableCell>
                <TableCell>{game.addedBy}</TableCell>
                <TableCell>
                  <Tooltip title="Edit game">
                    <IconButton onClick={() => handleEdit(game)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Games;