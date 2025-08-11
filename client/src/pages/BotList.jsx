import React, { useEffect, useState } from 'react';
import { listBots } from '../api.js';
import { Link as RouterLink } from 'react-router-dom';
import { CircularProgress, Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteBot } from '../api.js';

export default function BotList() {
    const [loading, setLoading] = useState(true);
    const [bots, setBots] = useState([]);

    useEffect(() => {
        listBots().then(setBots).finally(() => setLoading(false));
    }, []);

    // ADD this handler inside component
    async function handleDelete(slug, name) {
        const yes = window.confirm(`Delete bot "${name}"? This will remove all its threads.`);
        if (!yes) return;
        try {
            await deleteBot(slug);
            setBots(prev => prev.filter(b => b.slug !== slug));
        } catch (e) {
            alert('Failed to delete bot');
            console.error(e);
        }
    }


    if (loading) return <CircularProgress />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Bots</Typography>
                <List>
                    {bots.map(b => (
                        <ListItem
                            key={b.slug}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(b.slug, b.name); }}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                            disablePadding
                        >
                            <ListItemButton component={RouterLink} to={`/bots/${b.slug}`}>
                                <ListItemText primary={b.name} secondary={`Slug: ${b.slug}`} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {bots.length === 0 && <Typography color="text.secondary">No bots yet. Create one!</Typography>}
                </List>
            </CardContent>
        </Card>
    );
}
