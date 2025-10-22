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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../services/api';

function PlayerStatistics() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const allowedPlayers = await api.getAllowedPlayers();
        setPlayers(allowedPlayers);
      } catch (err) {
        setError('Failed to load players');
      }
    };
    loadPlayers();
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      if (!selectedPlayer) return;
      
      try {
        setLoading(true);
        const allGames = await api.getGames();
        setGames(allGames.filter(game => game.players.includes(selectedPlayer)));
        setLoading(false);
      } catch (err) {
        setError('Failed to load games');
        setLoading(false);
      }
    };
    loadGames();
  }, [selectedPlayer]);

  const calculateStats = () => {
    if (!selectedPlayer || !games.length) return [];

    const stats = {};
    
    // Initialize stats for all players
    players.forEach(player => {
      if (player !== selectedPlayer) {
        stats[player] = { wins: 0, losses: 0 };
      }
    });

    // Calculate stats from games
    games.forEach(game => {
      const opponent = game.players.find(p => p !== selectedPlayer);
      if (!stats[opponent]) return; // Skip if opponent is not in the current players list
      
      if (game.winner === selectedPlayer) {
        stats[opponent].losses++;
      } else {
        stats[opponent].wins++;
      }
    });

    // Convert to array and sort by total games
    return Object.entries(stats)
      .map(([opponent, record]) => ({
        opponent,
        ...record,
        total: record.wins + record.losses,
        winRate: record.wins + record.losses > 0
          ? ((record.losses / (record.wins + record.losses)) * 100).toFixed(1)
          : '0.0'
      }))
      .filter(stat => stat.total > 0) // Only show players with games played
      .sort((a, b) => b.total - a.total); // Sort by most games played
  };

  const playerStats = calculateStats();

  return (
    <div>
      <Typography variant="h4" component="h2" gutterBottom>
        Player vs Player Statistics
      </Typography>

      <Box sx={{ maxWidth: 300, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Select Player</InputLabel>
          <Select
            value={selectedPlayer}
            label="Select Player"
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            {players.map((player) => (
              <MenuItem key={player} value={player}>
                {player}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : selectedPlayer && playerStats.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Opponent</TableCell>
                <TableCell align="right">Games Played</TableCell>
                <TableCell align="right">Wins</TableCell>
                <TableCell align="right">Losses</TableCell>
                <TableCell align="right">Win Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playerStats.map((stat) => (
                <TableRow key={stat.opponent}>
                  <TableCell component="th" scope="row">
                    {stat.opponent}
                  </TableCell>
                  <TableCell align="right">{stat.total}</TableCell>
                  <TableCell align="right">{stat.wins}</TableCell>
                  <TableCell align="right">{stat.losses}</TableCell>
                  <TableCell align="right">{stat.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedPlayer ? (
        <Typography variant="body1">No games played yet.</Typography>
      ) : (
        <Typography variant="body1">Select a player to see their statistics.</Typography>
      )}
    </div>
  );
}

export default PlayerStatistics;