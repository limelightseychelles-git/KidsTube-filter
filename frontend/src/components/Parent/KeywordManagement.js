import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Alert, CircularProgress, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { keywordAPI } from '../../services/api';

const KeywordManagement = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const commonKeywords = ['violence', 'scary', 'horror', 'weapon', 'blood', 'death', 'inappropriate'];

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const response = await keywordAPI.getBlockedKeywords();
      setKeywords(response.data);
    } catch (error) {
      console.error('Error loading keywords:', error);
      setError('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      await keywordAPI.addBlockedKeyword(newKeyword.trim().toLowerCase());
      setSuccess(`Blocked "${newKeyword}"`);
      setNewKeyword('');
      loadKeywords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding keyword:', error);
      setError(error.response?.data?.error || 'Failed to add keyword');
    }
  };

  const handleQuickAdd = async (keyword) => {
    try {
      await keywordAPI.addBlockedKeyword(keyword);
      setSuccess(`Blocked "${keyword}"`);
      loadKeywords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding keyword:', error);
      setError(error.response?.data?.error || 'Failed to add keyword');
    }
  };

  const handleBulkAdd = async () => {
    try {
      await keywordAPI.bulkAddKeywords(commonKeywords);
      setSuccess('Added common blocked keywords');
      loadKeywords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error bulk adding keywords:', error);
      setError('Failed to bulk add keywords');
    }
  };

  const handleRemoveKeyword = async (id) => {
    if (!window.confirm('Remove this keyword?')) return;
    try {
      await keywordAPI.removeBlockedKeyword(id);
      setSuccess('Keyword removed');
      loadKeywords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing keyword:', error);
      setError('Failed to remove keyword');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Blocked Keywords</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Videos containing these keywords in title or description will be filtered out.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleAddKeyword}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" label="Add blocked keyword" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="e.g., violence, scary..." />
            <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!newKeyword.trim()} sx={{ minWidth: 100 }}>Add</Button>
          </Box>
        </form>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Quick Add Common Keywords:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {commonKeywords.map((keyword) => (
              <Chip key={keyword} label={keyword} onClick={() => handleQuickAdd(keyword)} clickable color="primary" variant="outlined" />
            ))}
            <Chip label="Add All" onClick={handleBulkAdd} clickable color="secondary" />
          </Box>
        </Box>
      </Paper>

      {keywords.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No blocked keywords yet. Add keywords above to filter content.</Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {keywords.map((keyword, index) => (
              <ListItem key={keyword.id} divider={index < keywords.length - 1}>
                <ListItemText primary={keyword.keyword} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveKeyword(keyword.id)} color="error">
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

export default KeywordManagement;
