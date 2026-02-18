const pool = require('../config/database');

// Get watch history with pagination
const getWatchHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM video_history'
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated history
    const result = await pool.query(
      `SELECT 
        id,
        video_id,
        title,
        channel_id,
        watched_at,
        duration_seconds
      FROM video_history 
      ORDER BY watched_at DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      history: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting watch history:', error);
    res.status(500).json({ error: 'Failed to get watch history' });
  }
};

// Get watch statistics
const getWatchStatistics = async (req, res) => {
  try {
    // Total videos watched
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM video_history'
    );

    // Videos watched today
    const todayResult = await pool.query(
      `SELECT COUNT(*) as today 
       FROM video_history 
       WHERE watched_at >= CURRENT_DATE`
    );

    // Videos watched this week
    const weekResult = await pool.query(
      `SELECT COUNT(*) as week 
       FROM video_history 
       WHERE watched_at >= CURRENT_DATE - INTERVAL '7 days'`
    );

    // Total watch time (all time) in seconds
    const totalTimeResult = await pool.query(
      'SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds FROM video_history'
    );

    // Watch time today in seconds
    const todayTimeResult = await pool.query(
      `SELECT COALESCE(SUM(duration_seconds), 0) as today_seconds 
       FROM video_history 
       WHERE watched_at >= CURRENT_DATE`
    );

    // Watch time this week in seconds
    const weekTimeResult = await pool.query(
      `SELECT COALESCE(SUM(duration_seconds), 0) as week_seconds 
       FROM video_history 
       WHERE watched_at >= CURRENT_DATE - INTERVAL '7 days'`
    );

    // Most watched channels
    const channelsResult = await pool.query(
      `SELECT 
        channel_id,
        COUNT(*) as watch_count
       FROM video_history 
       WHERE channel_id IS NOT NULL
       GROUP BY channel_id 
       ORDER BY watch_count DESC 
       LIMIT 5`
    );

    // Recent watch times (last 7 days)
    const recentResult = await pool.query(
      `SELECT 
        DATE(watched_at) as date,
        COUNT(*) as count,
        COALESCE(SUM(duration_seconds), 0) as total_seconds
       FROM video_history 
       WHERE watched_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(watched_at)
       ORDER BY date DESC`
    );

    // Convert seconds to hours
    const secondsToHours = (seconds) => {
      return (parseInt(seconds) / 3600).toFixed(1);
    };

    res.json({
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].today),
      thisWeek: parseInt(weekResult.rows[0].week),
      totalHours: secondsToHours(totalTimeResult.rows[0].total_seconds),
      todayHours: secondsToHours(todayTimeResult.rows[0].today_seconds),
      weekHours: secondsToHours(weekTimeResult.rows[0].week_seconds),
      topChannels: channelsResult.rows,
      recentActivity: recentResult.rows
    });
  } catch (error) {
    console.error('Error getting watch statistics:', error);
    res.status(500).json({ error: 'Failed to get watch statistics' });
  }
};

// Delete history entry
const deleteHistoryEntry = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM video_history WHERE id = $1', [id]);

    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
};

// Clear all history
const clearAllHistory = async (req, res) => {
  try {
    await pool.query('DELETE FROM video_history');

    res.json({ message: 'All history cleared successfully' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

module.exports = {
  getWatchHistory,
  getWatchStatistics,
  deleteHistoryEntry,
  clearAllHistory
};
