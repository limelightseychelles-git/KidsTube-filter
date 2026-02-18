import React, { useEffect } from 'react';
import { Box, Container, Button } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { videoAPI } from '../../services/api';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const recordView = async () => {
      try {
        await videoAPI.getVideoDetails(videoId);
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };
    recordView();
  }, [videoId]);

  const handleBack = () => {
    if (location.state?.searchResults) {
      navigate('/search', { state: { query: location.state.searchQuery, results: location.state.searchResults } });
    } else if (location.state?.returnPath) {
      navigate(location.state.returnPath);
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handleBack} sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}>← Back</Button>
        </Box>
        <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
          <ReactPlayer url={`https://www.youtube.com/watch?v=${videoId}`} width="100%" height="100%" controls playing style={{ position: 'absolute', top: 0, left: 0 }} />
        </Box>
      </Container>
    </Box>
  );
};

export default VideoPlayer;
