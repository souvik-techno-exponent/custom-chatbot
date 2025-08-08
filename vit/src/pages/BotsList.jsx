// BotsList.jsx
import { useEffect, useState } from 'react';
import { fetchBots, publishBot } from '../api';
import { Button, Stack, Typography, TextField } from '@mui/material';

export default function BotsList() {
    const [bots, setBots] = useState([]);
    const [domains, setDomains] = useState({}); // id -> text

    async function load() { setBots(await fetchBots()); }
    useEffect(() => { load(); }, []);

    async function onPublish(id) {
        const list = (domains[id] || '').split(',').map(s => s.trim()).filter(Boolean);
        const { embedScript } = await publishBot(id, list);
        navigator.clipboard.writeText(embedScript);
        alert('Published! Script copied to clipboard:\n\n' + embedScript);
        await load();
    }

    return (
        <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto', my: 4 }}>
            <Typography variant="h5">Your Bots</Typography>
            {bots.map(b => (
                <Stack key={b._id} direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ minWidth: 220 }}>{b.name}</Typography>
                    <TextField placeholder="Allowlisted domains (comma separated)"
                        value={domains[b._id] || ''}
                        onChange={e => setDomains({ ...domains, [b._id]: e.target.value })} />
                    <Button variant="outlined" onClick={() => onPublish(b._id)}>Publish</Button>
                    <Typography color={b.published ? 'green' : 'gray'}>
                        {b.published ? 'Published' : 'Draft'}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}
