import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Tabs, Tab, Card, CardContent, CardMedia, Grid, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { requestAPI } from '../../services/api';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

const VideoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await requestAPI.getVideoRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load video requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await requestAPI.approveVideoRequest(id);
      setSuccess('Video request approved!');
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await requestAPI.rejectVideoRequest(id);
      setSuccess('Video request rejected');
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await requestAPI.deleteVideoRequest(id);
      setSuccess('Request deleted');
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Failed to delete request');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const renderRequestCard = (request, showActions = false) => (
    <Card key={request.id} sx={{ mb: 2 }}>
      <Grid container>
        {request.videoDetails && request.videoDetails.snippet && (
          <Grid item xs={12} sm={4}>
            <CardMedia component="img" height="140" image={request.videoDetails.snippet.thumbnails?.medium?.url} alt={request.videoDetails.snippet.title} />
          </Grid>
        )}
        <Grid item xs={12} sm={request.videoDetails ? 8 : 12}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
              <Typography variant="h6">{request.videoDetails?.snippet?.title || 'Video Request'}</Typography>
              <IconButton size="small" onClick={() => window.open(request.video_url, '_blank')}>
                <OpenInNewIcon />
              </IconButton>
            </Box>
            {request.videoDetails?.snippet?.channelTitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>Channel: {request.videoDetails.snippet.channelTitle}</Typography>
            )}
            <Typography variant="caption" display="block" color="text.secondary">Requested: {formatDate(request.requested_at)}</Typography>
            {request.reviewed_at && (
              <Typography variant="caption" display="block" color="text.secondary">Reviewed: {formatDate(request.reviewed_at)}</Typography>
            )}
            {showActions && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(request.id)}>Approve</Button>
                <Button variant="contained" color="error" size="small" startIcon={<CancelIcon />} onClick={() => handleReject(request.id)}>Reject</Button>
              </Box>
            )}
            {!showActions && (
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(request.id)}>Delete</Button>
              </Box>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Video Requests</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Pending (${pendingRequests.length})`} />
          <Tab label={`Approved (${approvedRequests.length})`} />
          <Tab label={`Rejected (${rejectedRequests.length})`} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {pendingRequests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography color="text.secondary">No pending video requests</Typography>
          </Box>
        ) : (
          pendingRequests.map(request => renderRequestCard(request, true))
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {approvedRequests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography color="text.secondary">No approved requests</Typography>
          </Box>
        ) : (
          approvedRequests.map(request => renderRequestCard(request, false))
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {rejectedRequests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography color="text.secondary">No rejected requests</Typography>
          </Box>
        ) : (
          rejectedRequests.map(request => renderRequestCard(request, false))
        )}
      </TabPanel>
    </Box>
  );
};

export default VideoRequests;
