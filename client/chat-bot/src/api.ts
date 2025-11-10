const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';
export type BootstrapResp = { bot: import('../../src/types').Bot; questions: string[] };

export async function bootstrap(
    botSlug: string, threadKey: string, pageUrl: string
): Promise<BootstrapResp> {
    const r = await fetch(
        `${API}/threads/${botSlug}/thread?threadKey=${encodeURIComponent(threadKey)}&pageUrl=${encodeURIComponent(pageUrl)}`
    );

    if (!r.ok) throw new Error('Failed to bootstrap');
    return r.json();
}

// Stateless step advance: send answersCount only, server returns next question
export async function nextQuestion(botSlug: string, answersCount: number): Promise<{ nextQuestion: string | null }> {
    const r = await fetch(`${API}/threads/${botSlug}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answersCount })
    });
    if (!r.ok) throw new Error('Failed to get next question');
    return r.json();
}

// Persist transcript only on consent
export async function saveTranscript(
    botSlug: string,
    { threadKey, pageUrl, transcript }:
        { threadKey: string; pageUrl: string; transcript: { role: 'assistant' | 'user'; text: string; ts: number }[] }
): Promise<{ ok: boolean; saved: boolean; threadId: string }> {
    const r = await fetch(`${API}/threads/${botSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadKey, pageUrl, transcript })
    });
    if (!r.ok) throw new Error('Failed to save transcript');
    return r.json();
}