import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PINSetup from './components/Auth/PINSetup';
import PINLogin from './components/Auth/PINLogin';
import KidsHome from './components/Kids/KidsHome';
import VideoSearch from './components/Kids/VideoSearch';
import VideoPlayer from './components/Kids/VideoPlayer';
import RequestVideo from './components/Kids/RequestVideo';
import MyRequests from './components/Kids/MyRequests';
import ParentDashboard from './components/Parent/ParentDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { Box, CircularProgress } from '@mui/material';

function AppContent() {
  const { pinExists, loading } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (pinExists) {
      setSetupComplete(true);
    }
  }, [pinExists]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pinExists && !setupComplete) {
    return <PINSetup onComplete={() => setSetupComplete(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<KidsHome />} />
      <Route path="/search" element={<VideoSearch />} />
      <Route path="/watch/:videoId" element={<VideoPlayer />} />
      <Route path="/request" element={<RequestVideo />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/parent/login" element={<PINLogin />} />
      <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
