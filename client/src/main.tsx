import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import BotList from './pages/BotList.js';
import CreateBot from './pages/CreateBot.js';
import BotDetail from './pages/BotDetail.js';

function AppShell() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Chatbot Admin (POC)</Typography>
          <Button component={Link} to="/" color="inherit">Bots</Button>
          <Button component={Link} to="/new" color="inherit">Create Bot</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<BotList />} />
          <Route path="/new" element={<CreateBot />} />
          <Route path="/bots/:slug" element={<BotDetail />} />
        </Routes>
        <Box sx={{ my: 6, textAlign: 'center', color: 'text.secondary' }}>
          <small>No Auth • Pure POC • MUI</small>
        </Box>
      </Container>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);
