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
  Alert
} from '@mui/material';
import { api } from '../services/api';

function Statistics() {
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.getStats();
        setStats(statsData);
      } catch (err) {
        setError('Failed to load statistics. Please try again later.');
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Typography variant="h4" component="h2" gutterBottom>
        Player Statistics
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Losses</TableCell>
              <TableCell align="right">Win Rate</TableCell>
              <TableCell align="right">180s</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(stats)
              .sort(([, a], [, b]) => {
                // First sort by wins (descending)
                if (b.wins !== a.wins) {
                  return b.wins - a.wins;
                }
                // If wins are equal, sort by win rate (descending)
                const aTotal = a.wins + a.losses;
                const bTotal = b.wins + b.losses;
                const aWinRate = aTotal > 0 ? (a.wins / aTotal) : 0;
                const bWinRate = bTotal > 0 ? (b.wins / bTotal) : 0;
                if (bWinRate !== aWinRate) {
                  return bWinRate - aWinRate;
                }
                // If win rates are equal, sort by total games (descending)
                if (bTotal !== aTotal) {
                  return bTotal - aTotal;
                }
                // If everything is equal, sort alphabetically
                return 0;
              })
              .map(([player, data]) => {
                const totalGames = data.wins + data.losses;
                const winRate = totalGames > 0
                  ? ((data.wins / totalGames) * 100).toFixed(1)
                  : '0.0';

                return (
                  <TableRow key={player}>
                    <TableCell component="th" scope="row">
                      {player}
                    </TableCell>
                    <TableCell align="right">{data.wins}</TableCell>
                    <TableCell align="right">{data.losses}</TableCell>
                    <TableCell align="right">{winRate}%</TableCell>
                    <TableCell align="right">{data.oneEighties}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Statistics;