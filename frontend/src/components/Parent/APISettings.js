import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Alert, CircularProgress, Switch, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { settingsAPI } from '../../services/api';

const APISettings = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const response = await settingsAPI.getAPIKeys();
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    try {
      await settingsAPI.addAPIKey(newKey.trim());
      setSuccess('API key added successfully');
      setNewKey('');
      loadAPIKeys();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding API key:', error);
      setError(error.response?.data?.error || 'Failed to add API key');
    }
  };

  const handleToggleKey = async (id, currentStatus) => {
    try {
      await settingsAPI.toggleAPIKey(id, !currentStatus);
      setSuccess(`API key ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadAPIKeys();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling API key:', error);
      setError('Failed to toggle API key');
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm('Delete this API key?')) return;
    try {
      await settingsAPI.deleteAPIKey(id);
      setSuccess('API key deleted');
      loadAPIKeys();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError('Failed to delete API key');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">YouTube API Settings</Typography>
        <Button variant="outlined" startIcon={<InfoIcon />} onClick={() => setInfoDialogOpen(true)}>How to Get API Key</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage YouTube Data API keys for video search and playback.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleAddKey}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" label="Add YouTube API Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="AIzaSy..." helperText="API keys should start with 'AIzaSy'" />
            <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!newKey.trim()} sx={{ minWidth: 100 }}>Add</Button>
          </Box>
        </form>
      </Paper>
      {apiKeys.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No API keys configured. Add a YouTube Data API key to enable video search.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setInfoDialogOpen(true)}>Learn How to Get API Key</Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {apiKeys.map((key, index) => (
              <ListItem key={key.id} divider={index < apiKeys.length - 1}>
                <ListItemText primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{key.key_value}</Typography>
                    {key.is_active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />}
                  </Box>
                } secondary={`Added: ${new Date(key.created_at).toLocaleDateString()}`} />
                <ListItemSecondaryAction>
                  <Switch edge="end" checked={key.is_active} onChange={() => handleToggleKey(key.id, key.is_active)} sx={{ mr: 1 }} />
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteKey(key.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>How to Get a YouTube API Key</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Step 1: Go to Google Cloud Console</Typography>
          <Typography variant="body2" paragraph>Visit <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a></Typography>
          <Typography variant="h6" gutterBottom>Step 2: Create or Select a Project</Typography>
          <Typography variant="body2" paragraph>- Click "Select a project" at the top<br />- Click "New Project" and give it a name (e.g., "KidsTube Filter")</Typography>
          <Typography variant="h6" gutterBottom>Step 3: Enable YouTube Data API v3</Typography>
          <Typography variant="body2" paragraph>- Go to "APIs & Services" → "Library"<br />- Search for "YouTube Data API v3"<br />- Click on it and press "Enable"</Typography>
          <Typography variant="h6" gutterBottom>Step 4: Create API Credentials</Typography>
          <Typography variant="body2" paragraph>- Go to "APIs & Services" → "Credentials"<br />- Click "Create Credentials" → "API Key"<br />- Copy the API key that appears<br />- (Optional) Click "Restrict Key" to limit it to YouTube Data API v3</Typography>
          <Typography variant="h6" gutterBottom>Step 5: Add the Key Here</Typography>
          <Typography variant="body2">Paste the API key (starts with "AIzaSy...") in the form above.</Typography>
          <Alert severity="info" sx={{ mt: 3 }}><strong>Free Quota:</strong> YouTube provides 10,000 units per day for free. Each search costs ~100 units, so you can do about 100 searches per day.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APISettings;
