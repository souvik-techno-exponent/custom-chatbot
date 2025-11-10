import type { Bot, ThreadMessage } from './types';
const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';

export async function listBots(): Promise<Bot[]> {
    const r = await fetch(`${BASE}/bots`);
    if (!r.ok) throw new Error('Failed to load bots');
    return r.json();
}

export async function createBot(payload: Partial<Bot>): Promise<Bot> {
    const r = await fetch(`${BASE}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('Failed to create bot');
    return r.json();
}

export async function getBot(slug: string): Promise<Bot> {
    const r = await fetch(`${BASE}/bots/${slug}`);
    if (!r.ok) throw new Error('Bot not found');
    return r.json();
}


// ADD THIS function
export async function deleteBot(slug: string): Promise<{ ok: boolean }> {
    const r = await fetch(`${BASE}/bots/${slug}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete bot');
    return r.json();
}


// Persist transcript only on consent
export async function saveTranscript(
    botSlug: string,
    { threadKey, pageUrl, transcript }:
        { threadKey: string; pageUrl: string; transcript: ThreadMessage[] }
): Promise<{ ok: boolean; saved: boolean; threadId: string }> {
    const r = await fetch(`${BASE}/threads/${botSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadKey, pageUrl, transcript })
    });
    if (!r.ok) throw new Error('Failed to save transcript');
    return r.json();
}