const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function bootstrap(botSlug, threadKey, pageUrl) {
    const r = await fetch(`${API}/threads/${botSlug}/thread?threadKey=${encodeURIComponent(threadKey)}&pageUrl=${encodeURIComponent(pageUrl)}`);
    if (!r.ok) throw new Error('Failed to bootstrap');
    return r.json();
}

export async function sendUserMessage(botSlug, payload) {
    const r = await fetch(`${API}/threads/${botSlug}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('Failed to send message');
    return r.json();
}
