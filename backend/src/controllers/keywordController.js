const pool = require('../config/database');

// Get all blocked keywords
const getBlockedKeywords = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blocked_keywords ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting blocked keywords:', error);
    res.status(500).json({ error: 'Failed to get blocked keywords' });
  }
};

// Add blocked keyword
const addBlockedKeyword = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const trimmedKeyword = keyword.trim().toLowerCase();

    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM blocked_keywords WHERE LOWER(keyword) = $1',
      [trimmedKeyword]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Keyword already blocked' });
    }

    const result = await pool.query(
      'INSERT INTO blocked_keywords (keyword) VALUES ($1) RETURNING *',
      [trimmedKeyword]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding blocked keyword:', error);
    res.status(500).json({ error: 'Failed to add blocked keyword' });
  }
};

// Remove blocked keyword
const removeBlockedKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM blocked_keywords WHERE id = $1', [id]);

    res.json({ message: 'Keyword removed successfully' });
  } catch (error) {
    console.error('Error removing blocked keyword:', error);
    res.status(500).json({ error: 'Failed to remove blocked keyword' });
  }
};

// Bulk add keywords
const bulkAddKeywords = async (req, res) => {
  try {
    const { keywords } = req.body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    const added = [];
    const skipped = [];

    for (const keyword of keywords) {
      const trimmedKeyword = keyword.trim().toLowerCase();
      
      if (!trimmedKeyword) continue;

      // Check if already exists
      const existing = await pool.query(
        'SELECT id FROM blocked_keywords WHERE LOWER(keyword) = $1',
        [trimmedKeyword]
      );

      if (existing.rows.length > 0) {
        skipped.push(trimmedKeyword);
        continue;
      }

      const result = await pool.query(
        'INSERT INTO blocked_keywords (keyword) VALUES ($1) RETURNING *',
        [trimmedKeyword]
      );

      added.push(result.rows[0]);
    }

    res.json({
      added: added,
      skipped: skipped,
      message: `Added ${added.length} keywords, skipped ${skipped.length} duplicates`
    });
  } catch (error) {
    console.error('Error bulk adding keywords:', error);
    res.status(500).json({ error: 'Failed to bulk add keywords' });
  }
};

module.exports = {
  getBlockedKeywords,
  addBlockedKeyword,
  removeBlockedKeyword,
  bulkAddKeywords
};
