import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../../services/api';

const VideoSearch = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLatestVideos();
  }, []);

  const loadLatestVideos = async () => {
    setLoading(true);
    try {
      const response = await videoAPI.getLatestVideos(12);
      setVideos(response.data.items || []);
    } catch (error) {
      console.error('Error loading latest videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await videoAPI.searchVideos(query, 12);
      setVideos(response.data.items || []);
    } catch (error) {
      console.error('Error searching videos:', error);
      if (error.response?.status === 403 && error.response?.data?.error === 'blocked_keyword') {
        setError(error.response.data.message);
      } else {
        setError('Failed to search videos. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`, { state: { searchQuery: query, searchResults: videos } });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" align="center" sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>🔍 Search Videos</Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for videos..." variant="outlined" sx={{ bgcolor: 'white' }} />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' }, minWidth: 120 }}>Search</Button>
          </Box>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : videos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h6" color="text.secondary">No videos found. Try searching for something!</Typography></Box>
        ) : (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id.videoId}>
                <Card sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }} onClick={() => handleVideoClick(video.id.videoId)}>
                  <CardMedia component="img" height="180" image={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{video.snippet.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{video.snippet.channelTitle}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}>← Back to Home</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default VideoSearch;
