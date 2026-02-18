import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PINLogin = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(pin);
    if (result.success) {
      navigate('/parent');
    } else {
      setError(result.error);
      setPin('');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', m: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">Parent Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Enter PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} margin="normal" autoFocus inputProps={{ maxLength: 6, pattern: '[0-9]*' }} />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }}>Login</Button>
          <Button fullWidth variant="text" size="large" sx={{ mt: 2 }} onClick={() => navigate('/')}>Back to Kids View</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PINLogin;
