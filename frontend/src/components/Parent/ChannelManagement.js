import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Alert, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { channelAPI } from '../../services/api';

const ChannelManagement = () => {
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await channelAPI.getApprovedChannels();
      setChannels(response.data);
    } catch (error) {
      console.error('Error loading channels:', error);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const response = await channelAPI.searchChannels(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching channels:', error);
      setError('Failed to search channels');
    } finally {
      setSearching(false);
    }
  };

  const handleAddChannel = async (channelId, channelName) => {
    try {
      await channelAPI.addApprovedChannel(channelId, channelName);
      setSuccess(`Added ${channelName}`);
      loadChannels();
      setSearchResults([]);
      setSearchQuery('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding channel:', error);
      setError(error.response?.data?.error || 'Failed to add channel');
    }
  };

  const handleRemoveChannel = async (id) => {
    if (!window.confirm('Remove this channel?')) return;
    try {
      await channelAPI.removeApprovedChannel(id);
      setSuccess('Channel removed');
      loadChannels();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing channel:', error);
      setError('Failed to remove channel');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Approved Channels</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Only videos from these channels will be available to kids.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" label="Search for YouTube channels" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter channel name..." />
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={searching || !searchQuery.trim()} sx={{ minWidth: 120 }}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </form>

        {searchResults.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Search Results:</Typography>
            <Grid container spacing={2}>
              {searchResults.map((channel) => (
                <Grid item xs={12} sm={6} md={4} key={channel.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" noWrap>{channel.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {channel.id}
                      </Typography>
                      <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => handleAddChannel(channel.id, channel.name)} sx={{ mt: 1 }} fullWidth>
                        Add Channel
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {channels.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No approved channels yet. Search and add channels above.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {channels.map((channel, index) => (
              <ListItem key={channel.id} divider={index < channels.length - 1}>
                <ListItemText primary={channel.channel_name} secondary={`Channel ID: ${channel.channel_id}`} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveChannel(channel.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ChannelManagement;
