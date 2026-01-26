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
      .map(([opponent, record]) => {
        const total = record.wins + record.losses;
        const winRate = total > 0 ? ((record.losses / total) * 100).toFixed(1) : '0.0';
        const omjer = `${record.losses}/${record.wins}`;
        return {
          opponent,
          total,
          winRate,
          omjer
        };
      })
      .filter(stat => stat.total > 0)
      .sort((a, b) => {
        // Sort by win rate (percentage) descending
        const aRate = parseFloat(a.winRate);
        const bRate = parseFloat(b.winRate);
        if (bRate !== aRate) {
          return bRate - aRate;
        }
        // If same percentage, sort by total games
        return b.total - a.total;
      });
  };

  const playerStats = calculateStats();

  return (
    <div>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#fff !important', textAlign: 'center' }}>
        Igrač protiv igrača statistika
      </Typography>

      <Box sx={{ maxWidth: 300, mb: 4 }}>
        <FormControl fullWidth sx={{ backgroundColor: '#fafbaa', borderRadius: 1 }}>
          <InputLabel>Odaberi igrača</InputLabel>
          <Select
            value={selectedPlayer}
            label="Odaberi igrača"
            onChange={(e) => setSelectedPlayer(e.target.value)}
            sx={{ backgroundColor: '#fafbaa' }}
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
        <TableContainer component={Paper} sx={{ backgroundColor: '#fafbaa' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protivnik</TableCell>
                <TableCell align="right">%</TableCell>
                <TableCell align="right">Odigrano</TableCell>
                <TableCell align="right">Omjer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playerStats.map((stat, idx) => (
                <TableRow key={stat.opponent} sx={{ backgroundColor: idx % 2 === 1 ? '#e9e260' : '#fafbaa' }}>
                  <TableCell component="th" scope="row">
                    {stat.opponent}
                  </TableCell>
                  <TableCell align="right">{stat.winRate}%</TableCell>
                  <TableCell align="right">{stat.total}</TableCell>
                  <TableCell align="right">{stat.omjer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedPlayer ? (
        <Typography variant="body1">No games played yet.</Typography>
      ) : (
        <Typography variant="body1">Odaberi igrača da vidim omjer sa drugima.</Typography>
      )}
    </div>
  );
}

export default PlayerStatistics;