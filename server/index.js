const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

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

// Get all games
app.get('/api/games', async (req, res) => {
    try {
        const games = await db.getAllGames();
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Add new game
app.post('/api/games', async (req, res) => {
    try {
        const newGame = {
            ...req.body,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        const savedGame = await db.addGame(newGame);
        res.json(savedGame);
    } catch (error) {
        console.error('Error adding game:', error);
        res.status(500).json({ error: 'Failed to add game' });
    }
});

// Update existing game
app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedGame = req.body;
        
        // Ensure we have valid data before proceeding
        if (!updatedGame.players || !updatedGame.winner || !updatedGame.oneEighties) {
            return res.status(400).json({ error: 'Invalid game data provided' });
        }

        const result = await db.updateGame(id, updatedGame);
        res.json(result);
    } catch (error) {
        console.error('Error updating game:', error);
        if (error.message === 'Game not found') {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.status(500).json({ error: 'Failed to update game' });
    }
});

// Get player stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getAllStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Reset all data
app.post('/api/reset', async (req, res) => {
    try {
        console.log('Received reset request');
        await db.resetAllData();
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
            'danijel.m',
            'nikola.z',
            'Josip'
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Simple database ping to keep connection alive
        await db.pool.query('SELECT 1');
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ status: 'error', error: error.message });
    }
});

// Initialize data file and start server
db.initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Database initialized and connected');
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});