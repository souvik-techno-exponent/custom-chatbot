// api.js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function fetchBots() {
    const r = await fetch(`${API_BASE}/api/bots`);
    return r.json();
}
export async function createBot(payload) {
    const r = await fetch(`${API_BASE}/api/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return r.json();
}
export async function publishBot(id, allowlistedDomains = []) {
    const r = await fetch(`${API_BASE}/api/bots/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowlistedDomains })
    });
    return r.json();
}
