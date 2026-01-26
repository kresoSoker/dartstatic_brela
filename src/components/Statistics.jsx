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
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#fff !important' }}>
        Statistika igrača
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#fafbaa' }}>
        <Table>
          <TableHead>
            <TableRow>
                <TableCell>Igrač</TableCell>
                <TableCell align="right">%</TableCell>
                <TableCell align="right">Odigrano</TableCell>
                <TableCell align="right">Omjer</TableCell>
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
              .map(([player, data], idx) => {
                const totalGames = data.wins + data.losses;
                const winRate = totalGames > 0
                  ? ((data.wins / totalGames) * 100).toFixed(1)
                  : '0.0';
                const omjer = `${data.wins}/${data.losses}`;
                return (
                  <TableRow key={player} sx={{backgroundColor: idx % 2 === 1 ? '#e9e260' : '#fafbaa' }}>
                    <TableCell component="th" scope="row">
                      {player}
                    </TableCell>
                    <TableCell align="right">{winRate}%</TableCell>
                    <TableCell align="right">{totalGames}</TableCell>
                    <TableCell align="right">{omjer}</TableCell>
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