const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function bootstrap(botSlug, threadKey, pageUrl) {
    const r = await fetch(
        `${API}/threads/${botSlug}/thread?threadKey=${encodeURIComponent(threadKey)}&pageUrl=${encodeURIComponent(pageUrl)}`
    );

    if (!r.ok) throw new Error('Failed to bootstrap');
    return r.json();
}

// Stateless step advance: send answersCount only, server returns next question
export async function nextQuestion(botSlug, answersCount) {
    const r = await fetch(`${API}/threads/${botSlug}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answersCount })
    });
    if (!r.ok) throw new Error('Failed to get next question');
    return r.json();
}

// Persist transcript only on consent
export async function saveTranscript(botSlug, { threadKey, pageUrl, transcript }) {
    const r = await fetch(`${API}/threads/${botSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadKey, pageUrl, transcript })
    });
    if (!r.ok) throw new Error('Failed to save transcript');
    return r.json();
}