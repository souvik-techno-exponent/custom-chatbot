import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBot } from '../api.js';
import { Card, CardContent, Typography, TextField, Stack, Button } from '@mui/material';

export default function BotDetail() {
    const { slug } = useParams();
    const [bot, setBot] = useState(null);

    useEffect(() => {
        getBot(slug).then(setBot);
    }, [slug]);

    if (!bot) return null;

    const snippet = `<script src="http://localhost:4000/embed.js" data-bot-slug="${bot.slug}"></script>`;

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
            </CardContent>
        </Card>
    );
}
