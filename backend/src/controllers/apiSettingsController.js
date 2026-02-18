const pool = require('../config/database');

// Get all API keys (masked)
const getAPIKeys = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, key_value, is_active, created_at FROM api_keys ORDER BY created_at DESC'
    );

    // Mask API keys (show only last 4 characters)
    const maskedKeys = result.rows.map(key => ({
      ...key,
      key_value: maskAPIKey(key.key_value)
    }));

    res.json(maskedKeys);
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
};

// Add new API key
const addAPIKey = async (req, res) => {
  try {
    const { key_value } = req.body;

    if (!key_value || !key_value.trim()) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Basic validation for YouTube API key format
    if (!key_value.startsWith('AIzaSy')) {
      return res.status(400).json({ error: 'Invalid YouTube API key format' });
    }

    // Check if key already exists
    const existing = await pool.query(
      'SELECT id FROM api_keys WHERE key_value = $1',
      [key_value.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This API key already exists' });
    }

    const result = await pool.query(
      'INSERT INTO api_keys (key_value, is_active) VALUES ($1, $2) RETURNING *',
      [key_value.trim(), true]
    );

    res.json({
      ...result.rows[0],
      key_value: maskAPIKey(result.rows[0].key_value)
    });
  } catch (error) {
    console.error('Error adding API key:', error);
    res.status(500).json({ error: 'Failed to add API key' });
  }
};

// Toggle API key active status
const toggleAPIKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await pool.query(
      'UPDATE api_keys SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      ...result.rows[0],
      key_value: maskAPIKey(result.rows[0].key_value)
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    res.status(500).json({ error: 'Failed to toggle API key' });
  }
};

// Delete API key
const deleteAPIKey = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM api_keys WHERE id = $1', [id]);

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

// Helper function to mask API key
const maskAPIKey = (key) => {
  if (!key || key.length < 8) return '****';
  return '••••••••••••••••••••' + key.slice(-4);
};

module.exports = {
  getAPIKeys,
  addAPIKey,
  toggleAPIKey,
  deleteAPIKey
};
