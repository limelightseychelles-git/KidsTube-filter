import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import { authAPI } from '../../services/api';

const ChangePIN = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPin || !newPin || !confirmPin) {
      setError('All fields are required');
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setError('New PIN must be 4-6 digits');
      return;
    }
    if (!/^\d+$/.test(newPin)) {
      setError('PIN must contain only numbers');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    if (currentPin === newPin) {
      setError('New PIN must be different from current PIN');
      return;
    }

    try {
      const response = await authAPI.changePIN(currentPin, newPin);
      setSuccess(response.data.message);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error changing PIN:', err);
      setError(err.response?.data?.error || 'Failed to change PIN');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Change Parent PIN</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update your PIN to secure the parent dashboard.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockResetIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6">Security Settings</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Current PIN" type={showCurrentPin ? 'text' : 'password'} value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} margin="normal" inputProps={{ maxLength: 6, pattern: '[0-9]*' }} InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCurrentPin(!showCurrentPin)} edge="end">
                  {showCurrentPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }} />
          <TextField fullWidth label="New PIN (4-6 digits)" type={showNewPin ? 'text' : 'password'} value={newPin} onChange={(e) => setNewPin(e.target.value)} margin="normal" inputProps={{ maxLength: 6, pattern: '[0-9]*' }} InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPin(!showNewPin)} edge="end">
                  {showNewPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }} />
          <TextField fullWidth label="Confirm New PIN" type={showConfirmPin ? 'text' : 'password'} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} margin="normal" inputProps={{ maxLength: 6, pattern: '[0-9]*' }} InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPin(!showConfirmPin)} edge="end">
                  {showConfirmPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }} />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={!currentPin || !newPin || !confirmPin}>Change PIN</Button>
        </form>
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2"><strong>Remember your new PIN!</strong> You'll need it to access the parent dashboard.</Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default ChangePIN;
