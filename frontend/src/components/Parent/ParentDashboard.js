import React, { useState } from 'react';
import { Box, Button, Typography, Container, Paper, Tabs, Tab } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChannelManagement from './ChannelManagement';
import KeywordManagement from './KeywordManagement';
import WatchHistory from './WatchHistory';
import VideoRequests from './VideoRequests';
import APISettings from './APISettings';
import ChangePIN from './ChangePIN';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

const ParentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">Parent Dashboard</Typography>
          <Button variant="outlined" onClick={handleLogout}>Logout</Button>
        </Box>
        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
            <Tab label="📺 Approved Channels" />
            <Tab label="🚫 Blocked Keywords" />
            <Tab label="📊 Watch History" />
            <Tab label="📝 Video Requests" />
            <Tab label="🔑 API Settings" />
            <Tab label="🔐 Change PIN" />
          </Tabs>
          <TabPanel value={tabValue} index={0}><ChannelManagement /></TabPanel>
          <TabPanel value={tabValue} index={1}><KeywordManagement /></TabPanel>
          <TabPanel value={tabValue} index={2}><WatchHistory /></TabPanel>
          <TabPanel value={tabValue} index={3}><VideoRequests /></TabPanel>
          <TabPanel value={tabValue} index={4}><APISettings /></TabPanel>
          <TabPanel value={tabValue} index={5}><ChangePIN /></TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default ParentDashboard;
