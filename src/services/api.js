import axios from 'axios';

// Determine if we're in production (GitHub Pages) or development
const isProduction = window.location.hostname !== 'localhost';

// Use the Render.com backend in production, localhost in development
const API_URL = isProduction 
  ? 'https://dartstatic-brela-backend.onrender.com/api'
  : 'http://localhost:5000/api';

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('API URL:', API_URL);

const axiosConfig = {
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
};

export const api = {
  // Get all games
  getGames: async () => {
    const response = await axios.get(`${API_URL}/games`);
    return response.data;
  },

  // Add new game
  addGame: async (gameData) => {
    const response = await axios.post(`${API_URL}/games`, gameData);
    return response.data;
  },

  // Update existing game
  updateGame: async (id, gameData) => {
    try {
      console.log('Updating game with ID:', id);
      console.log('Update payload:', gameData);
      const response = await axios.put(`${API_URL}/games/${id}`, gameData);
      return response.data;
    } catch (error) {
      console.error('Error updating game:', error.response?.data || error.message);
      console.error('Request details:', {
        url: `${API_URL}/games/${id}`,
        payload: gameData
      });
      throw error;
    }
  },

  // Get player statistics
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  },

  // Reset all data
  resetData: async () => {
    try {
      console.log('Sending reset request to server...');
      const response = await axios.post(`${API_URL}/reset`);
      console.log('Reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reset API error:', error);
      throw error;
    }
  },

  // Get allowed players
  getAllowedPlayers: async () => {
    try {
      console.log('Fetching players from:', `${API_URL}/players`);
      const response = await axios.get(`${API_URL}/players`, axiosConfig);
      console.log('Players from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
};