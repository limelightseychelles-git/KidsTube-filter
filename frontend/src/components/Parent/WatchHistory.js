import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Paper, Alert, CircularProgress, Grid, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { historyAPI } from '../../services/api';

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        historyAPI.getWatchHistory(50, 0),
        historyAPI.getWatchStatistics()
      ]);
      setHistory(historyResponse.data.history);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this history entry?')) return;
    try {
      await historyAPI.deleteHistoryEntry(id);
      setSuccess('Entry deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry');
    }
  };

  const handleClearAll = async () => {
    try {
      await historyAPI.clearAllHistory();
      setSuccess('All history cleared successfully');
      setClearDialogOpen(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Failed to clear history');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    else if (minutes > 0) return `${minutes}m ${secs}s`;
    else return `${secs}s`;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Watch History</Typography>
        <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={() => setClearDialogOpen(true)} disabled={history.length === 0}>Clear All History</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {stats && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OndemandVideoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography color="text.secondary" variant="body2">Total Videos Watched</Typography>
                  </Box>
                  <Typography variant="h4">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OndemandVideoIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography color="text.secondary" variant="body2">Watched Today</Typography>
                  </Box>
                  <Typography variant="h4">{stats.today}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OndemandVideoIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography color="text.secondary" variant="body2">This Week</Typography>
                  </Box>
                  <Typography variant="h4">{stats.thisWeek}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.dark' }} />
                    <Typography color="primary.dark" variant="body2" fontWeight="bold">Total Watch Time</Typography>
                  </Box>
                  <Typography variant="h4" color="primary.dark">{stats.totalHours} hrs</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'success.dark' }} />
                    <Typography color="success.dark" variant="body2" fontWeight="bold">Watch Time Today</Typography>
                  </Box>
                  <Typography variant="h4" color="success.dark">{stats.todayHours} hrs</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'info.dark' }} />
                    <Typography color="info.dark" variant="body2" fontWeight="bold">Watch Time This Week</Typography>
                  </Box>
                  <Typography variant="h4" color="info.dark">{stats.weekHours} hrs</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {history.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No watch history yet. Videos watched by kids will appear here.</Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {history.map((item, index) => (
              <ListItem key={item.id} divider={index < history.length - 1} secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="open" onClick={() => window.open(`https://www.youtube.com/watch?v=${item.video_id}`, '_blank')} sx={{ mr: 1 }}>
                    <OpenInNewIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEntry(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }>
                <ListItemText primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body1">{item.title || item.video_id}</Typography>
                    <Chip label={formatDate(item.watched_at)} size="small" variant="outlined" />
                    {item.duration_seconds > 0 && <Chip icon={<AccessTimeIcon />} label={formatDuration(item.duration_seconds)} size="small" color="primary" variant="outlined" />}
                  </Box>
                } secondary={<Typography variant="body2" color="text.secondary">Video ID: {item.video_id}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Watch History?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete all watch history records. This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WatchHistory;
