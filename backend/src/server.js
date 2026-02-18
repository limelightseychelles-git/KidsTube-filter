const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const channelRoutes = require('./routes/channels');
const keywordRoutes = require('./routes/keywords');
const historyRoutes = require('./routes/history');
const requestRoutes = require('./routes/requests');
const apiSettingsRoutes = require('./routes/apiSettings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/settings', apiSettingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KidsTube Filter API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
});
