import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { requestAPI } from '../../services/api';

const RequestVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await requestAPI.submitVideoRequest(videoUrl);
      setSuccess(response.data.message);
      setVideoUrl('');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" align="center" sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>📝 Request a Video</Typography>
        <Typography variant="h6" align="center" sx={{ color: '#666', mb: 4 }}>Found a video you'd like to watch? Ask a parent for permission!</Typography>
        <Paper sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="YouTube Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." variant="outlined" sx={{ mb: 3 }} helperText="Paste the link to the YouTube video you want to watch" />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button type="submit" variant="contained" size="large" startIcon={<SendIcon />} disabled={loading || !videoUrl.trim()} sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' }, px: 4 }}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/')} sx={{ borderColor: '#667eea', color: '#667eea', '&:hover': { borderColor: '#5568d3', bgcolor: '#f0f4ff' }, px: 4 }}>Cancel</Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RequestVideo;
