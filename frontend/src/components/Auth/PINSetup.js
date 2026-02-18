import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PINSetup = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const { initializePIN } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    const result = await initializePIN(pin);
    if (result.success) {
      onComplete();
    } else {
      setError(result.error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', m: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">KidsTube Filter</Typography>
        <Typography variant="h6" gutterBottom align="center" color="text.secondary">Setup Parent PIN</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Create PIN (4-6 digits)" type="password" value={pin} onChange={(e) => setPin(e.target.value)} margin="normal" inputProps={{ maxLength: 6, pattern: '[0-9]*' }} />
          <TextField fullWidth label="Confirm PIN" type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} margin="normal" inputProps={{ maxLength: 6, pattern: '[0-9]*' }} />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }}>Create PIN</Button>
        </form>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} align="center">This PIN will be used to access the parent dashboard</Typography>
      </Paper>
    </Box>
  );
};

export default PINSetup;
