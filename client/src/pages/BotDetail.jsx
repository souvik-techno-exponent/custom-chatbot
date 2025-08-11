import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBot } from '../api.js';
import { Card, CardContent, Typography, TextField, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { deleteBot } from '../api.js';
import DeleteIcon from '@mui/icons-material/Delete';

const EMBED_BASE = import.meta.env.VITE_EMBED_BASE || window.location.origin;
const WIDGET_PATH = import.meta.env.VITE_WIDGET_PATH || '/chat-bot/index.html';


export default function BotDetail() {
    const { slug } = useParams();
    const [bot, setBot] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        getBot(slug).then(setBot);
    }, [slug]);

    async function onDelete() {
        if (!bot) return;
        const yes = window.confirm(`Delete bot "${bot.name}"? This will remove all its threads.`);
        if (!yes) return;
        try {
            await deleteBot(bot.slug);
            nav('/'); // go back to list
        } catch (e) {
            alert('Failed to delete bot');
            console.error(e);
        }
    }

    if (!bot) return null;

    const snippet = `<script src="${EMBED_BASE}/embed.js" data-bot-slug="${bot.slug}" data-widget-path="${WIDGET_PATH}"></script>`;

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>{bot.name}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Slug: {bot.slug}</Typography>
                <Typography variant="subtitle1">Embed this script on any website:</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <TextField fullWidth value={snippet} InputProps={{ readOnly: true }} />
                    <Button onClick={() => navigator.clipboard.writeText(snippet)} variant="outlined">Copy</Button>
                </Stack>
                <Typography variant="subtitle1" sx={{ mt: 3 }}>Selected Questions (5)</Typography>
                <ul>
                    {bot.questions.map((q, idx) => <li key={idx}><Typography variant="body2">{q}</Typography></li>)}
                </ul>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button variant="outlined" color="error" onClick={onDelete} startIcon={<DeleteIcon />}>
                        Delete Bot
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
