const pool = require('../config/database');
const youtubeService = require('../services/youtubeService');

// Search videos with filtering
const searchVideos = async (req, res) => {
  try {
    const { query, maxResults = 12 } = req.query;

    // Get blocked keywords first
    const blockedKeywords = await pool.query(
      'SELECT keyword FROM blocked_keywords'
    );
    const blockedKeywordList = blockedKeywords.rows.map(row => 
      row.keyword.toLowerCase()
    );

    // Check if search query contains blocked keywords
    if (query) {
      const searchLower = query.toLowerCase();
      const foundBlockedKeyword = blockedKeywordList.find(keyword => 
        searchLower.includes(keyword)
      );

      if (foundBlockedKeyword) {
        return res.status(403).json({ 
          error: 'blocked_keyword',
          message: `The keyword "${foundBlockedKeyword}" is not allowed. Please try a different search.`,
          blockedKeyword: foundBlockedKeyword
        });
      }
    }

    // Get approved channels
    const approvedChannels = await pool.query(
      'SELECT channel_id, channel_name FROM approved_channels'
    );
    const approvedChannelIds = approvedChannels.rows.map(row => row.channel_id);

    let allVideos = [];

    // If there are approved channels, search within them
    if (approvedChannelIds.length > 0) {
      // Search each approved channel
      const searchPromises = approvedChannelIds.map(async (channelId) => {
        try {
          // Build search query: user query + channel filter
          const searchQuery = query 
            ? `${query} ${approvedChannels.rows.find(c => c.channel_id === channelId)?.channel_name || ''}`
            : approvedChannels.rows.find(c => c.channel_id === channelId)?.channel_name || '';

          const results = await youtubeService.searchVideos(
            searchQuery,
            Math.ceil(maxResults / approvedChannelIds.length)
          );
          
          // Filter to only videos from this specific channel
          return results.items.filter(video => video.snippet.channelId === channelId);
        } catch (error) {
          console.error(`Error searching channel ${channelId}:`, error);
          return [];
        }
      });

      const channelResults = await Promise.all(searchPromises);
      allVideos = channelResults.flat();
    } else {
      // No approved channels - search normally
      if (!query) {
        return res.json({ items: [], totalResults: 0, query: '' });
      }
      
      const youtubeResults = await youtubeService.searchVideos(query, maxResults);
      allVideos = youtubeResults.items;
    }

    // Filter out videos with blocked keywords in title/description
    const filteredVideos = allVideos.filter(video => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();

      const hasBlockedKeyword = blockedKeywordList.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );

      return !hasBlockedKeyword;
    });

    // Remove duplicates and limit results
    const uniqueVideos = Array.from(
      new Map(filteredVideos.map(v => [v.id.videoId, v])).values()
    ).slice(0, maxResults);

    res.json({
      items: uniqueVideos,
      totalResults: uniqueVideos.length,
      query: query || ''
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
};

// Get latest videos from approved channels (for homepage)
const getLatestVideos = async (req, res) => {
  try {
    const { maxResults = 12 } = req.query;

    // Get approved channels
    const approvedChannels = await pool.query(
      'SELECT channel_id, channel_name FROM approved_channels'
    );

    if (approvedChannels.rows.length === 0) {
      return res.json({ items: [], totalResults: 0 });
    }

    // Get blocked keywords
    const blockedKeywords = await pool.query(
      'SELECT keyword FROM blocked_keywords'
    );
    const blockedKeywordList = blockedKeywords.rows.map(row => 
      row.keyword.toLowerCase()
    );

    // Get latest videos from each channel
    const videoPromises = approvedChannels.rows.map(async (channel) => {
      try {
        const results = await youtubeService.searchVideos(
          channel.channel_name,
          Math.ceil(maxResults / approvedChannels.rows.length)
        );
        
        // Only return videos from this specific channel
        return results.items.filter(video => video.snippet.channelId === channel.channel_id);
      } catch (error) {
        console.error(`Error getting videos for channel ${channel.channel_id}:`, error);
        return [];
      }
    });

    const channelVideos = await Promise.all(videoPromises);
    const allVideos = channelVideos.flat();

    // Filter blocked keywords
    const filteredVideos = allVideos.filter(video => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();

      const hasBlockedKeyword = blockedKeywordList.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );

      return !hasBlockedKeyword;
    });

    // Remove duplicates, sort by date, and limit
    const uniqueVideos = Array.from(
      new Map(filteredVideos.map(v => [v.id.videoId, v])).values()
    )
    .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt))
    .slice(0, maxResults);

    res.json({
      items: uniqueVideos,
      totalResults: uniqueVideos.length
    });
  } catch (error) {
    console.error('Error getting latest videos:', error);
    res.status(500).json({ error: 'Failed to get latest videos' });
  }
};

// Get video details
const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    const videoData = await youtubeService.getVideoDetails(videoId);

    // Save to history with duration
    if (videoData.items && videoData.items.length > 0) {
      const video = videoData.items[0];
      
      // Parse ISO 8601 duration (PT1H2M10S format) to seconds
      let durationSeconds = 0;
      if (video.contentDetails && video.contentDetails.duration) {
        const duration = video.contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || 0);
          const minutes = parseInt(match[2] || 0);
          const seconds = parseInt(match[3] || 0);
          durationSeconds = (hours * 3600) + (minutes * 60) + seconds;
        }
      }

      await pool.query(
        'INSERT INTO video_history (video_id, title, channel_id, duration_seconds) VALUES ($1, $2, $3, $4)',
        [videoId, video.snippet.title, video.snippet.channelId, durationSeconds]
      );
    }

    res.json(videoData);
  } catch (error) {
    console.error('Error getting video details:', error);
    res.status(500).json({ error: 'Failed to get video details' });
  }
};

// Request video approval
const requestVideo = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    await pool.query(
      'INSERT INTO video_requests (video_url, status) VALUES ($1, $2)',
      [videoUrl, 'pending']
    );

    res.json({ message: 'Video request submitted successfully' });
  } catch (error) {
    console.error('Error requesting video:', error);
    res.status(500).json({ error: 'Failed to submit video request' });
  }
};

module.exports = {
  searchVideos,
  getLatestVideos,
  getVideoDetails,
  requestVideo
};
