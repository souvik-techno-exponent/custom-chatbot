import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, IconButton, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { bootstrap, nextQuestion, saveTranscript } from './api.js';

// Parse query params set by embed script
function useParams() {
  return useMemo(() => Object.fromEntries(new URLSearchParams(window.location.search)), []);
}

export default function App() {
  const { bot: botSlug, thread: threadKey, page: pageUrl } = useParams();
  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [askSaveOpen, setAskSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const chatRef = useRef(null);

  // 1) Run bootstrap ONCE per slug/thread/page change
  useEffect(() => {
    async function init() {
      const { bot, questions } = await bootstrap(botSlug, threadKey, pageUrl);
      setBot(bot);
      if (questions?.[0]) {
        setMessages([{ role: 'assistant', text: questions[0], ts: Date.now() }]);
      }
    }
    init();
  }, [botSlug, threadKey, pageUrl]);

  // 2) Handle beforeunload separately so deps can include messages/saved
  useEffect(() => {
    const onBeforeUnload = (e) => {
      const hasUserMsgs = messages.some(m => m.role === 'user');
      if (!saved && hasUserMsgs) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [messages, saved]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    // Add user message locally
    let newMsgs = [];
    setMessages(prev => {
      newMsgs = [...prev, { role: 'user', text, ts: Date.now() }];
      return newMsgs;
    });
    try {
      // answersCount = number of user answers so far
      const answersCount = (newMsgs.filter(m => m.role === 'user')).length;
      const { nextQuestion: nq } = await nextQuestion(botSlug, answersCount);
      if (nq) {
        setMessages(prev => [...prev, { role: 'assistant', text: nq, ts: Date.now() }]);
      } else {
        // no next question => completed (after 5th)
        setAskSaveOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveConsent(ok) {
    setAskSaveOpen(false);
    if (!ok) return;
    try {
      await saveTranscript(botSlug, { threadKey, pageUrl, transcript: messages });
      setSaved(true);
    } catch (e) {
      console.error(e);
      // optionally show a toast
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      <AppBar position="static" sx={{ bgcolor: bot?.brandColor || '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{bot?.name || 'Assistant'}</Typography>
          {saved && <Typography variant="caption" sx={{ ml: 2, opacity: 0.85 }}>Transcript saved</Typography>}
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

      {/* Consent dialog */}
      <Dialog open={askSaveOpen} onClose={() => handleSaveConsent(false)}>
        <DialogTitle>Save chat?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Do you want to save the chat?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSaveConsent(false)}>No</Button>
          <Button onClick={() => handleSaveConsent(true)} variant="contained">Yes, save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
