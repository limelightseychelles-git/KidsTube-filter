const axios = require('axios');
const redisClient = require('../config/redis');
const pool = require('../config/database');

class YouTubeService {
  constructor() {
    this.currentKeyIndex = 0;
    this.apiKeys = [];
  }

  async loadAPIKeys() {
    try {
      // Try to get keys from database first
      const result = await pool.query(
        'SELECT key_value FROM api_keys WHERE is_active = true ORDER BY created_at'
      );

      if (result.rows.length > 0) {
        this.apiKeys = result.rows.map(row => row.key_value);
        return;
      }

      // Fallback to .env if no database keys
      if (process.env.YOUTUBE_API_KEYS) {
        this.apiKeys = process.env.YOUTUBE_API_KEYS.split(',').map(k => k.trim());
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      // Fallback to .env
      if (process.env.YOUTUBE_API_KEYS) {
        this.apiKeys = process.env.YOUTUBE_API_KEYS.split(',').map(k => k.trim());
      }
    }
  }

  async getNextAPIKey() {
    if (this.apiKeys.length === 0) {
      await this.loadAPIKeys();
    }

    if (this.apiKeys.length === 0) {
      throw new Error('No YouTube API keys available');
    }

    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  async searchVideos(query, maxResults = 10) {
    const cacheKey = `search:${query}:${maxResults}`;
    
    // Check cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log('Cache hit for:', query);
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    // Fetch from YouTube API
    const apiKey = await this.getNextAPIKey();
    const url = 'https://www.googleapis.com/youtube/v3/search';
    
    try {
      const response = await axios.get(url, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          key: apiKey,
          safeSearch: 'strict'
        }
      });

      // Cache the result for 12 hours
      try {
        await redisClient.setEx(
          cacheKey,
          parseInt(process.env.REDIS_TTL),
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error('Redis set error:', error);
      }

      return response.data;
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }

  async getVideoDetails(videoId) {
    const cacheKey = `video:${videoId}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (error) {
      console.error('Redis get error:', error);
    }

    const apiKey = await this.getNextAPIKey();
    const url = 'https://www.googleapis.com/youtube/v3/videos';
    
    try {
      const response = await axios.get(url, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: apiKey
        }
      });

      try {
        await redisClient.setEx(
          cacheKey,
          parseInt(process.env.REDIS_TTL),
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error('Redis set error:', error);
      }

      return response.data;
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }
}

module.exports = new YouTubeService();
