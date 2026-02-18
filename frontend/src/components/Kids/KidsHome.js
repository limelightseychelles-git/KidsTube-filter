import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const KidsHome = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}>🎬 KidsTube</Typography>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>What would you like to watch today?</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/search')} sx={{ bgcolor: 'white', color: '#f5576c', '&:hover': { bgcolor: '#f0f0f0' }, px: 4, py: 2, fontSize: '1.2rem' }}>🔍 Search Videos</Button>
            <Button variant="contained" size="large" onClick={() => navigate('/my-requests')} sx={{ bgcolor: 'white', color: '#f5576c', '&:hover': { bgcolor: '#f0f0f0' }, px: 4, py: 2, fontSize: '1.2rem' }}>📋 My Requests</Button>
            <Button variant="contained" size="large" onClick={() => navigate('/request')} sx={{ bgcolor: 'white', color: '#f5576c', '&:hover': { bgcolor: '#f0f0f0' }, px: 4, py: 2, fontSize: '1.2rem' }}>📝 Request Video</Button>
          </Box>
        </Box>
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }} onClick={() => navigate('/parent/login')}>👨‍👩‍👧 Parent Access</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default KidsHome;
