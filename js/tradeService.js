/**
 * Trade API Service
 * Handles communication between frontend and backend for trade data
 */

class TradeService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api'; // Update this for production
    this.token = this.getAuthToken(); // Use same token logic as auth.js
  }

  // Get token from both localStorage and sessionStorage
  getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token); // Use same key as auth.js
  }

  // Clear authentication token (logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem('token'); // Use same key as auth.js
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get authentication headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-auth-token': this.token // Use same header format as auth.js
    };
  }

  // Get all trades for the current user
  async getTrades() {
    try {
      const response = await fetch(`${this.baseURL}/trades`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch trades');
      }

      return data.trades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  }

  // Add a new trade
  async addTrade(tradeData) {
    try {
      const response = await fetch(`${this.baseURL}/trades`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(tradeData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add trade');
      }

      return data.trade;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  }

  // Update an existing trade
  async updateTrade(tradeId, tradeData) {
    try {
      const response = await fetch(`${this.baseURL}/trades/${tradeId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(tradeData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update trade');
      }

      return data.trade;
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  }

  // Delete a trade
  async deleteTrade(tradeId) {
    try {
      const response = await fetch(`${this.baseURL}/trades/${tradeId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete trade');
      }

      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  }

  // Get trade statistics
  async getTradeStats() {
    try {
      const response = await fetch(`${this.baseURL}/trades/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch statistics');
      }

      return data.stats;
    } catch (error) {
      console.error('Error fetching trade stats:', error);
      throw error;
    }
  }

  // Bulk import trades (migrate from localStorage)
  async bulkImportTrades(trades) {
    try {
      const response = await fetch(`${this.baseURL}/trades/bulk`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ trades })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to import trades');
      }

      return data.trades;
    } catch (error) {
      console.error('Error importing trades:', error);
      throw error;
    }
  }

  // Sync local trades with database
  async syncTrades() {
    try {
      // Get trades from localStorage
      const localTrades = JSON.parse(localStorage.getItem('trades') || '[]');
      
      if (localTrades.length === 0) {
        // No local trades, just fetch from server
        return await this.getTrades();
      }

      // Check if user wants to sync local data
      const shouldSync = confirm(
        `Found ${localTrades.length} trades in local storage. Do you want to sync them to your account?`
      );

      if (shouldSync) {
        // Import local trades to database
        await this.bulkImportTrades(localTrades);
        
        // Clear localStorage after successful sync
        localStorage.removeItem('trades');
        
        // Return updated trades from server
        return await this.getTrades();
      } else {
        // Just return server trades
        return await this.getTrades();
      }
    } catch (error) {
      console.error('Error syncing trades:', error);
      // Fallback to local trades if sync fails
      return JSON.parse(localStorage.getItem('trades') || '[]');
    }
  }
}

// Create a global instance
window.tradeService = new TradeService();