import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, IconButton, Paper, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { bootstrap, sendUserMessage } from './api.js';

// Parse query params set by embed script
function useParams() {
  return useMemo(() => Object.fromEntries(new URLSearchParams(window.location.search)), []);
}

export default function App() {
  const { bot: botSlug, thread: threadKey, page: pageUrl } = useParams();
  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { bot, thread, questions } = await bootstrap(botSlug, threadKey, pageUrl);
      setBot(bot);
      setMessages(thread.messages);

      const hasAssistant = thread.messages.some(m => m.role === 'assistant');
      const hasUser = thread.messages.some(m => m.role === 'user');

      // If first visit: ask first question from server-provided questions
      if (!hasAssistant && !hasUser && questions.length > 0) {
        setMessages(prev => [...prev, { role: 'assistant', text: questions[0] }]);
      }
    }
    init();
  }, [botSlug, threadKey, pageUrl]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    try {
      const { thread, nextQuestion } = await sendUserMessage(botSlug, {
        threadKey,
        pageUrl,
        text
      });
      setMessages(thread.messages);
      if (nextQuestion) {
        setMessages(prev => [...prev, { role: 'assistant', text: nextQuestion }]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      <AppBar position="static" sx={{ bgcolor: bot?.brandColor || '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{bot?.name || 'Assistant'}</Typography>
        </Toolbar>
      </AppBar>

      <Box ref={chatRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((m, i) => (
          <Paper
            key={i}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              p: 1.2,
              maxWidth: '80%',
              bgcolor: m.role === 'user' ? '#e3f2fd' : '#f5f5f5'
            }}
            elevation={1}
          >
            <Typography variant="body2">{m.text}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ p: 1, borderTop: '1px solid #eee' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
          />
          <IconButton color="primary" onClick={onSend}><SendIcon /></IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
