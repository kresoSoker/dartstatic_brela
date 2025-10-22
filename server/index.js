const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'https://kresosoker.github.io',
    'https://dartstatic-brela-backend.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({ games: [], stats: {} }));
    }
}

// Read data from file
async function readData() {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

// Write data to file
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all games
app.get('/api/games', async (req, res) => {
    try {
        const data = await readData();
        // Ensure all games have IDs
        const gamesWithIds = data.games.map(game => {
            if (!game.id) {
                game.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            return game;
        });
        // Save the updated games if any were missing IDs
        if (gamesWithIds.some(game => !game.id)) {
            data.games = gamesWithIds;
            await writeData(data);
        }
        res.json(gamesWithIds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Add new game
app.post('/api/games', async (req, res) => {
    try {
        const data = await readData();
        const newGame = {
            ...req.body,
            id: Date.now().toString(), // Add unique ID
            createdAt: new Date().toISOString()
        };
        
        // Update games
        data.games.push(newGame);
        
        // Update stats
        const winner = newGame.winner;
        const loser = newGame.players.find(player => player !== winner);
        
        if (!data.stats[winner]) {
            data.stats[winner] = { wins: 0, losses: 0, oneEighties: 0 };
        }
        if (!data.stats[loser]) {
            data.stats[loser] = { wins: 0, losses: 0, oneEighties: 0 };
        }
        
        data.stats[winner].wins += 1;
        data.stats[loser].losses += 1;
        
        // Update 180s for both players
        if (newGame.oneEighties[winner]) {
            data.stats[winner].oneEighties += newGame.oneEighties[winner];
        }
        if (newGame.oneEighties[loser]) {
            data.stats[loser].oneEighties += newGame.oneEighties[loser];
        }
        
        await writeData(data);
        res.json(newGame);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add game' });
    }
});

// Update existing game
app.put('/api/games/:id', async (req, res) => {
    try {
        const data = await readData();
        const { id } = req.params;
        const updatedGame = req.body;
        
        // Find the game
        const gameIndex = data.games.findIndex(game => game.id === id);
        if (gameIndex === -1) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const oldGame = data.games[gameIndex];
        
        // Ensure we have valid data before proceeding
        if (!updatedGame.players || !updatedGame.winner || !updatedGame.oneEighties) {
            return res.status(400).json({ error: 'Invalid game data provided' });
        }

        // Update stats for the old game (subtract)
        if (oldGame.winner) {
            data.stats[oldGame.winner].wins -= 1;
            const oldLoser = oldGame.players.find(player => player !== oldGame.winner);
            data.stats[oldLoser].losses -= 1;

            // Remove old 180s
            Object.entries(oldGame.oneEighties).forEach(([player, count]) => {
                data.stats[player].oneEighties -= count;
            });
        }

        // Update stats for the new game (add)
        data.stats[updatedGame.winner].wins += 1;
        const newLoser = updatedGame.players.find(player => player !== updatedGame.winner);
        data.stats[newLoser].losses += 1;

        // Add new 180s
        Object.entries(updatedGame.oneEighties).forEach(([player, count]) => {
            data.stats[player].oneEighties += count;
        });

        // Update the game
        data.games[gameIndex] = {
            ...updatedGame,
            id,
            lastModified: new Date().toISOString()
        };

        await writeData(data);
        res.json(data.games[gameIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update game' });
    }
});

// Get player stats
app.get('/api/stats', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Reset all data
app.post('/api/reset', async (req, res) => {
    try {
        console.log('Received reset request');
        const emptyData = {
            games: [],
            stats: {}
        };
        console.log('Writing empty data:', emptyData);
        await writeData(emptyData);
        console.log('Data reset completed');
        res.json({ message: 'Data reset successfully' });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: error.message || 'Failed to reset data' });
    }
});

// Get allowed players
app.get('/api/players', async (req, res) => {
    try {
        console.log('GET /api/players - Request received');
        console.log('Request headers:', req.headers);
        
        const allowedPlayers = [
            'kresimir.b',
            'karlo.m',
            'marino.j',
            'frane.g',
            'ante.c',
            'dalibor.m',
            'kruno.u',
            'danijel.m'
        ].sort();
        
        console.log('Sending players list:', allowedPlayers);
        
        // Set CORS headers explicitly
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        // Set cache control headers
        res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        
        res.json(allowedPlayers);
        console.log('Response sent successfully');
    } catch (error) {
        console.error('Error in /api/players:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Initialize data file and start server
initializeDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});