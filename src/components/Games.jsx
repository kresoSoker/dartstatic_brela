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
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function Games({ username }) {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleGameInfoClose = () => {
    setSelectedGame(null);
  };

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        gap: 2,
        mb: 2 
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h2"
          sx={{ textAlign: isMobile ? 'center' : 'left' }}
        >
          Game History
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          size={isMobile ? "small" : "medium"}
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete all games? This cannot be undone.')) {
              try {
                const result = await api.resetData();
                setGames([]);
                setError(null);
              } catch (error) {
                setError('Failed to reset data: ' + (error.response?.data?.error || error.message));
              }
            }
          }}
        >
          Reset All Data
        </Button>
      </Box>

      <TableContainer 
        component={Paper}
        sx={{
          '.MuiTableCell-root': {
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            '&:last-child': { pr: { xs: 1, sm: 2 } }
          }
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Score</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>180s</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Added By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id || game.date}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {new Date(game.date).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '100px', sm: '200px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {game.players.join(' vs ')}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{game.winner}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {game.score}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {game.players.map(player => 
                    `${player}: ${game.oneEighties[player] || 0}`
                  ).join(', ')}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {game.addedBy}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {game.addedBy === username && (
                      <IconButton 
                        onClick={() => handleEdit(game)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </IconButton>
                    )}
                    {isMobile && (
                      <IconButton
                        onClick={() => setSelectedGame(game)}
                        size="small"
                        sx={{ p: 0.5 }}
                      >
                        <InfoIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Info Dialog */}
      <Dialog open={Boolean(selectedGame)} onClose={handleGameInfoClose}>
        <DialogTitle>Game Details</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography><strong>Score:</strong> {selectedGame?.score}</Typography>
            <Typography><strong>180s:</strong> {
              selectedGame?.players.map(player => 
                `${player}: ${selectedGame.oneEighties[player] || 0}`
              ).join(', ')
            }</Typography>
            <Typography><strong>Added By:</strong> {selectedGame?.addedBy}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGameInfoClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Games;