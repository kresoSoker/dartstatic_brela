const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Create games table
        await client.query(`
            CREATE TABLE IF NOT EXISTS games (
                id VARCHAR(255) PRIMARY KEY,
                date TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_modified TIMESTAMP,
                players TEXT[] NOT NULL,
                winner VARCHAR(255) NOT NULL,
                score VARCHAR(50) NOT NULL,
                one_eighties JSONB NOT NULL,
                added_by VARCHAR(255) NOT NULL
            )
        `);

        // Create stats table
        await client.query(`
            CREATE TABLE IF NOT EXISTS stats (
                player VARCHAR(255) PRIMARY KEY,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                one_eighties INTEGER DEFAULT 0
            )
        `);

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Get all games
async function getAllGames() {
    const result = await pool.query('SELECT * FROM games ORDER BY date DESC');
    return result.rows.map(row => ({
        id: row.id,
        date: row.date,
        createdAt: row.created_at,
        lastModified: row.last_modified,
        players: row.players,
        winner: row.winner,
        score: row.score,
        oneEighties: row.one_eighties,
        addedBy: row.added_by
    }));
}

// Add a new game
async function addGame(game) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert the game
        const insertGameQuery = `
            INSERT INTO games (id, date, created_at, players, winner, score, one_eighties, added_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const gameValues = [
            game.id,
            game.date,
            game.createdAt,
            game.players,
            game.winner,
            game.score,
            JSON.stringify(game.oneEighties),
            game.addedBy
        ];
        const gameResult = await client.query(insertGameQuery, gameValues);

        // Update stats
        const winner = game.winner;
        const loser = game.players.find(player => player !== winner);

        // Ensure stats exist for both players
        await client.query(`
            INSERT INTO stats (player, wins, losses, one_eighties)
            VALUES ($1, 0, 0, 0)
            ON CONFLICT (player) DO NOTHING
        `, [winner]);

        await client.query(`
            INSERT INTO stats (player, wins, losses, one_eighties)
            VALUES ($1, 0, 0, 0)
            ON CONFLICT (player) DO NOTHING
        `, [loser]);

        // Update winner stats
        await client.query(`
            UPDATE stats
            SET wins = wins + 1,
                one_eighties = one_eighties + $1
            WHERE player = $2
        `, [game.oneEighties[winner] || 0, winner]);

        // Update loser stats
        await client.query(`
            UPDATE stats
            SET losses = losses + 1,
                one_eighties = one_eighties + $1
            WHERE player = $2
        `, [game.oneEighties[loser] || 0, loser]);

        await client.query('COMMIT');

        return {
            id: gameResult.rows[0].id,
            date: gameResult.rows[0].date,
            createdAt: gameResult.rows[0].created_at,
            players: gameResult.rows[0].players,
            winner: gameResult.rows[0].winner,
            score: gameResult.rows[0].score,
            oneEighties: gameResult.rows[0].one_eighties,
            addedBy: gameResult.rows[0].added_by
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Update an existing game
async function updateGame(id, updatedGame) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the old game
        const oldGameResult = await client.query('SELECT * FROM games WHERE id = $1', [id]);
        if (oldGameResult.rows.length === 0) {
            throw new Error('Game not found');
        }
        const oldGame = oldGameResult.rows[0];

        // Revert old stats
        const oldWinner = oldGame.winner;
        const oldLoser = oldGame.players.find(player => player !== oldWinner);

        await client.query(`
            UPDATE stats
            SET wins = wins - 1,
                one_eighties = one_eighties - $1
            WHERE player = $2
        `, [oldGame.one_eighties[oldWinner] || 0, oldWinner]);

        await client.query(`
            UPDATE stats
            SET losses = losses - 1,
                one_eighties = one_eighties - $1
            WHERE player = $2
        `, [oldGame.one_eighties[oldLoser] || 0, oldLoser]);

        // Update the game
        const updateGameQuery = `
            UPDATE games
            SET date = $1,
                players = $2,
                winner = $3,
                score = $4,
                one_eighties = $5,
                last_modified = $6
            WHERE id = $7
            RETURNING *
        `;
        const gameValues = [
            updatedGame.date,
            updatedGame.players,
            updatedGame.winner,
            updatedGame.score,
            JSON.stringify(updatedGame.oneEighties),
            new Date().toISOString(),
            id
        ];
        const gameResult = await client.query(updateGameQuery, gameValues);

        // Apply new stats
        const newWinner = updatedGame.winner;
        const newLoser = updatedGame.players.find(player => player !== newWinner);

        await client.query(`
            UPDATE stats
            SET wins = wins + 1,
                one_eighties = one_eighties + $1
            WHERE player = $2
        `, [updatedGame.oneEighties[newWinner] || 0, newWinner]);

        await client.query(`
            UPDATE stats
            SET losses = losses + 1,
                one_eighties = one_eighties + $1
            WHERE player = $2
        `, [updatedGame.oneEighties[newLoser] || 0, newLoser]);

        await client.query('COMMIT');

        return {
            id: gameResult.rows[0].id,
            date: gameResult.rows[0].date,
            createdAt: gameResult.rows[0].created_at,
            lastModified: gameResult.rows[0].last_modified,
            players: gameResult.rows[0].players,
            winner: gameResult.rows[0].winner,
            score: gameResult.rows[0].score,
            oneEighties: gameResult.rows[0].one_eighties,
            addedBy: gameResult.rows[0].added_by
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Get all stats
async function getAllStats() {
    const result = await pool.query('SELECT * FROM stats');
    const stats = {};
    result.rows.forEach(row => {
        stats[row.player] = {
            wins: row.wins,
            losses: row.losses,
            oneEighties: row.one_eighties
        };
    });
    return stats;
}

// Reset all data
async function resetAllData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM games');
        await client.query('DELETE FROM stats');
        await client.query('COMMIT');
        console.log('All data reset successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    initializeDatabase,
    getAllGames,
    addGame,
    updateGame,
    getAllStats,
    resetAllData,
    pool
};
