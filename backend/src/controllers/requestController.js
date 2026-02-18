const pool = require('../config/database');
const youtubeService = require('../services/youtubeService');

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's just the video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
};

// Get all video requests
const getVideoRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM video_requests';
    let params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY requested_at DESC';

    const result = await pool.query(query, params);

    // Get video details for each request
    const requestsWithDetails = await Promise.all(
      result.rows.map(async (request) => {
        try {
          // Extract video ID from URL
          const videoId = extractVideoId(request.video_url);
          if (videoId) {
            const videoData = await youtubeService.getVideoDetails(videoId);
            if (videoData.items && videoData.items.length > 0) {
              return {
                ...request,
                videoId,
                videoDetails: videoData.items[0]
              };
            }
          }
        } catch (error) {
          console.error('Error getting video details:', error);
        }
        return {
          ...request,
          videoId: extractVideoId(request.video_url),
          videoDetails: null
        };
      })
    );

    res.json(requestsWithDetails);
  } catch (error) {
    console.error('Error getting video requests:', error);
    res.status(500).json({ error: 'Failed to get video requests' });
  }
};

// Submit video request (from kids)
const submitVideoRequest = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Extract video ID
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Check if already requested
    const existing = await pool.query(
      `SELECT id, status FROM video_requests 
       WHERE video_url = $1 OR video_url LIKE $2`,
      [videoUrl, `%${videoId}%`]
    );

    if (existing.rows.length > 0) {
      const existingRequest = existing.rows[0];
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ error: 'This video has already been requested and is pending approval' });
      } else if (existingRequest.status === 'approved') {
        return res.status(400).json({ error: 'This video has already been approved' });
      }
    }

    const result = await pool.query(
      'INSERT INTO video_requests (video_url, status) VALUES ($1, $2) RETURNING *',
      [videoUrl, 'pending']
    );

    res.json({ 
      message: 'Video request submitted successfully! Ask a parent to check.',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting video request:', error);
    res.status(500).json({ error: 'Failed to submit video request' });
  }
};

// Approve video request
const approveVideoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE video_requests 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ 
      message: 'Video request approved',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving video request:', error);
    res.status(500).json({ error: 'Failed to approve video request' });
  }
};

// Reject video request
const rejectVideoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE video_requests 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      ['rejected', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ 
      message: 'Video request rejected',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting video request:', error);
    res.status(500).json({ error: 'Failed to reject video request' });
  }
};

// Delete video request
const deleteVideoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM video_requests WHERE id = $1', [id]);

    res.json({ message: 'Video request deleted successfully' });
  } catch (error) {
    console.error('Error deleting video request:', error);
    res.status(500).json({ error: 'Failed to delete video request' });
  }
};

// Get all video requests (public - for kids to view their requests)
const getMyVideoRequests = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM video_requests ORDER BY requested_at DESC'
    );

    // Get video details for each request
    const requestsWithDetails = await Promise.all(
      result.rows.map(async (request) => {
        try {
          // Extract video ID from URL
          const videoId = extractVideoId(request.video_url);
          if (videoId) {
            const videoData = await youtubeService.getVideoDetails(videoId);
            if (videoData.items && videoData.items.length > 0) {
              return {
                ...request,
                videoId,
                videoDetails: videoData.items[0]
              };
            }
          }
        } catch (error) {
          console.error('Error getting video details:', error);
        }
        return {
          ...request,
          videoId: extractVideoId(request.video_url),
          videoDetails: null
        };
      })
    );

    res.json(requestsWithDetails);
  } catch (error) {
    console.error('Error getting video requests:', error);
    res.status(500).json({ error: 'Failed to get video requests' });
  }
};


module.exports = {
  getVideoRequests,
  getMyVideoRequests,
  submitVideoRequest,
  approveVideoRequest,
  rejectVideoRequest,
  deleteVideoRequest
};
