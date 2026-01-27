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
          sx={{ textAlign: isMobile ? 'center' : 'left', color: '#fff !important' }}
        >
          Povijest mečeva
        </Typography>
        {username === 'kresimir.b' && (
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
        )}
      </Box>

      <TableContainer 
        component={Paper}
        sx={{
          backgroundColor: '#fafbaa',
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
              <TableCell>Datum</TableCell>
              <TableCell>Igrač 1</TableCell>
              <TableCell>Rezultat</TableCell>
              <TableCell>Igrač 2</TableCell>
              <TableCell>Info</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game, idx) => {
              const [player1, player2] = game.players;
              let [score1, score2] = (game.score || '').split('-').map(s => s.trim());
              const n1 = parseInt(score1, 10);
              const n2 = parseInt(score2, 10);
              let scoreColor1 = '#1976d2', scoreColor2 = '#1976d2';
              if (!isNaN(n1) && !isNaN(n2) && n1 !== n2) {
                if (n1 > n2) {
                  scoreColor1 = 'green';
                  scoreColor2 = 'red';
                } else if (n2 > n1) {
                  scoreColor1 = 'red';
                  scoreColor2 = 'green';
                }
              }
              const isOdd = idx % 2 === 1;
              return (
                <TableRow key={game.id || game.date} sx={{ backgroundColor: isOdd ? '#e9e260' : '#fafbaa' }}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(game.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{player1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                    <span style={{ color: scoreColor1 }}>{score1}</span>
                    {' - '}
                    <span style={{ color: scoreColor2 }}>{score2}</span>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{player2}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => setSelectedGame(game)} size={isMobile ? 'small' : 'medium'}>
                      <InfoIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                    {username === 'kresimir.b' && (
                      <IconButton 
                        onClick={() => handleEdit(game)}
                        size={isMobile ? "small" : "medium"}
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info Dialog */}
      <Dialog open={Boolean(selectedGame)} onClose={handleGameInfoClose}>
        <DialogTitle>Detalji meča</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography><strong>Upisao:</strong> {selectedGame?.addedBy}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGameInfoClose}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Games;