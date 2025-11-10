// Simple API helper
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function listBots() {
    const r = await fetch(`${BASE}/bots`);
    if (!r.ok) throw new Error('Failed to load bots');
    return r.json();
}

export async function createBot(payload) {
    const r = await fetch(`${BASE}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('Failed to create bot');
    return r.json();
}

export async function getBot(slug) {
    const r = await fetch(`${BASE}/bots/${slug}`);
    if (!r.ok) throw new Error('Bot not found');
    return r.json();
}


// ADD THIS function
export async function deleteBot(slug) {
    const r = await fetch(`${BASE}/bots/${slug}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete bot');
    return r.json();
}


// Persist transcript only on consent
export async function saveTranscript(botSlug, { threadKey, pageUrl, transcript }) {
    const r = await fetch(`${BASE}/threads/${botSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadKey, pageUrl, transcript })
    });
    if (!r.ok) throw new Error('Failed to save transcript');
    return r.json();
}