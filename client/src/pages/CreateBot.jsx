import React, { useState } from 'react';
import { createBot } from '../api.js';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Button, Stack, Typography } from '@mui/material';

export default function CreateBot() {
    const [name, setName] = useState('My Chatbot');
    const [brandColor, setBrandColor] = useState('#1976d2');
    const [welcomeText, setWelcomeText] = useState("Hi! I'm your assistant.");
    const nav = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        const bot = await createBot({ name, brandColor, welcomeText });
        nav(`/bots/${bot.slug}`);
    }

    return (
        <Card component="form" onSubmit={onSubmit}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Create Bot</Typography>
                <Stack spacing={2}>
                    <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required />
                    <TextField label="Brand Color" value={brandColor} onChange={e => setBrandColor(e.target.value)} helperText="e.g. #1976d2" />
                    <TextField label="Welcome Text" value={welcomeText} onChange={e => setWelcomeText(e.target.value)} />
                    <Button type="submit" variant="contained">Create</Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
