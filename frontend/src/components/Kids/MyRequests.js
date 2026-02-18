import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip, CircularProgress, Alert, Button, Tabs, Tab, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../../services/api';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await requestAPI.getMyVideoRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`, { state: { returnPath: '/my-requests' } });
  };

  const renderVideoCard = (request) => {
    const isApproved = request.status === 'approved';
    const isPending = request.status === 'pending';
    const isRejected = request.status === 'rejected';

    return (
      <Grid item xs={12} sm={6} md={4} key={request.id}>
        <Card sx={{ position: 'relative', cursor: isApproved ? 'pointer' : 'default', transition: 'transform 0.2s', '&:hover': isApproved ? { transform: 'scale(1.05)' } : {}, opacity: isRejected ? 0.7 : 1 }} onClick={() => isApproved && request.videoId && handleVideoClick(request.videoId)}>
          {request.videoDetails && request.videoDetails.snippet ? (
            <Box sx={{ position: 'relative' }}>
              <CardMedia component="img" height="180" image={request.videoDetails.snippet.thumbnails?.medium?.url} alt={request.videoDetails.snippet.title} />
              {isRejected && <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CancelIcon sx={{ fontSize: 80, color: '#ff5252' }} /></Box>}
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                {isPending && <Chip icon={<HourglassEmptyIcon />} label="Waiting" color="warning" size="small" />}
                {isApproved && <Chip icon={<CheckCircleIcon />} label="Approved!" color="success" size="small" />}
                {isRejected && <Chip icon={<CancelIcon />} label="Not Allowed" color="error" size="small" />}
              </Box>
            </Box>
          ) : (
            <Box sx={{ height: 180, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="text.secondary">Loading...</Typography></Box>
          )}
          <CardContent>
            <Typography variant="h6" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '3em' }}>{request.videoDetails?.snippet?.title || 'Video Request'}</Typography>
            {request.videoDetails?.snippet?.channelTitle && <Typography variant="body2" color="text.secondary">{request.videoDetails.snippet.channelTitle}</Typography>}
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>Requested: {new Date(request.requested_at).toLocaleDateString()}</Typography>
            {isApproved && <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>✓ Click to watch!</Typography>}
            {isPending && <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>⏳ Ask a parent to check requests</Typography>}
            {isRejected && <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>✗ This video wasn't approved</Typography>}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" align="center" sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>📝 My Video Requests</Typography>
        <Typography variant="h6" align="center" sx={{ color: '#666', mb: 4 }}>See the status of videos you've requested</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : requests.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="text.secondary">No video requests yet</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>When you find a video you'd like to watch, use the "Request Video" button to ask for permission!</Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/request')} sx={{ mt: 2, bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}>Request a Video</Button>
          </Paper>
        ) : (
          <>
            <Paper sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label={`⏳ Waiting (${pendingRequests.length})`} sx={{ fontSize: '1.1rem', py: 2 }} />
                <Tab label={`✓ Approved (${approvedRequests.length})`} sx={{ fontSize: '1.1rem', py: 2 }} />
                <Tab label={`✗ Not Allowed (${rejectedRequests.length})`} sx={{ fontSize: '1.1rem', py: 2 }} />
              </Tabs>
            </Paper>
            <TabPanel value={tabValue} index={0}>
              {pendingRequests.length === 0 ? <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No requests waiting for approval</Typography></Paper> : <Grid container spacing={3}>{pendingRequests.map(request => renderVideoCard(request))}</Grid>}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {approvedRequests.length === 0 ? <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No approved videos yet</Typography></Paper> : <Grid container spacing={3}>{approvedRequests.map(request => renderVideoCard(request))}</Grid>}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {rejectedRequests.length === 0 ? <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No rejected requests</Typography></Paper> : <Grid container spacing={3}>{rejectedRequests.map(request => renderVideoCard(request))}</Grid>}
            </TabPanel>
          </>
        )}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' }, px: 4, py: 1.5 }}>← Back to Home</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default MyRequests;
