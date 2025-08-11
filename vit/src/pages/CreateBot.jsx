// CreateBot.jsx
import { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import { createBot } from '../api';

export default function CreateBot() {
    const [name, setName] = useState('My First Bot');
    const [primaryColor, setPrimaryColor] = useState('#1976d2');
    const [launcherText, setLauncherText] = useState('Chat');
    const [title, setTitle] = useState('Assistant');
    const [questions, setQuestions] = useState([
        "What's your name?",
        "What's your email?",
        "What are you looking for?",
        "What's your budget range?",
        "When do you want to start?"
    ]);

    async function onSave() {
        const bot = await createBot({
            name,
            brand: { primaryColor, launcherText, title },
            questions
        });
        alert('Bot created: ' + bot._id);
        window.location.href = '/admin';
    }

    return (
        <Stack spacing={2} sx={{ maxWidth: 640, mx: 'auto', my: 4 }}>
            <Button href="/admin" variant="text">Back to Bots</Button>
            <TextField label="Bot Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField label="Brand Color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
            <TextField label="Launcher Text" value={launcherText} onChange={e => setLauncherText(e.target.value)} />
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} />
            {/* For simplicity, a single textarea for 5 questions (comma separated) */}
            <TextField
                label="Questions (comma separated, 5)"
                value={questions.join(', ')}
                onChange={e => setQuestions(e.target.value.split(',').map(s => s.trim()))}
                multiline rows={3}
            />
            <Button variant="contained" onClick={onSave}>Save Bot</Button>
        </Stack>
    );
}
