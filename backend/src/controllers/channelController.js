const pool = require('../config/database');
const youtubeService = require('../services/youtubeService');

// Get all approved channels
const getApprovedChannels = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM approved_channels ORDER BY approved_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting approved channels:', error);
    res.status(500).json({ error: 'Failed to get approved channels' });
  }
};

// Add approved channel
const addApprovedChannel = async (req, res) => {
  try {
    const { channelId, channelName } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM approved_channels WHERE channel_id = $1',
      [channelId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Channel already approved' });
    }

    const result = await pool.query(
      'INSERT INTO approved_channels (channel_id, channel_name) VALUES ($1, $2) RETURNING *',
      [channelId, channelName]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding approved channel:', error);
    res.status(500).json({ error: 'Failed to add approved channel' });
  }
};

// Remove approved channel
const removeApprovedChannel = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM approved_channels WHERE id = $1', [id]);

    res.json({ message: 'Channel removed successfully' });
  } catch (error) {
    console.error('Error removing approved channel:', error);
    res.status(500).json({ error: 'Failed to remove approved channel' });
  }
};

// Search for channels to approve
const searchChannels = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for channels using YouTube API
    const results = await youtubeService.searchVideos(query, 5);
    
    // Extract unique channels
    const channelsMap = new Map();
    results.items.forEach(item => {
      const channelId = item.snippet.channelId;
      if (!channelsMap.has(channelId)) {
        channelsMap.set(channelId, {
          channelId: channelId,
          channelName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.default.url
        });
      }
    });

    res.json(Array.from(channelsMap.values()));
  } catch (error) {
    console.error('Error searching channels:', error);
    res.status(500).json({ error: 'Failed to search channels' });
  }
};

module.exports = {
  getApprovedChannels,
  addApprovedChannel,
  removeApprovedChannel,
  searchChannels
};
