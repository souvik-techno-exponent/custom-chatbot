// ChatWidget.jsx
import React, { useEffect, useRef, useState } from 'react';
import { saveTranscript } from './api.js';

const API_BASE = (window.__WIDGET_CONFIG__ && window.__WIDGET_CONFIG__.API_BASE) || 'http://localhost:4000';

export default function ChatWidget() {
    const [opened, setOpened] = useState(false);
    const [saved, setSaved] = useState(false);
    const [brand, setBrand] = useState({ primaryColor: '#1976d2', title: 'Assistant', launcherText: 'Chat' });
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const anonUserTokenRef = useRef(null);
    const embedToken = (window.__WIDGET_CONFIG__ && window.__WIDGET_CONFIG__.embedToken);

    // persist anon token on widget origin → cross-site continuity
    function getAnonToken() {
        let t = localStorage.getItem('cb_anon');
        if (!t) {
            t = Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem('cb_anon', t);
        }
        return t;
    }

    async function init() {
        const anonUserToken = getAnonToken();
        anonUserTokenRef.current = anonUserToken;

        const r = await fetch(`${API_BASE}/api/conversations/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embedToken,
                anonUserToken,
                pageURL: document.referrer || window.parent?.location?.href || ''
            })
        });
        const data = await r.json();
        if (data.error) { console.error(data.error); return; }

        setConversationId(data.conversationId);
        setBrand(data.brand || brand);
        if (data.question) {
            setMessages([{ role: 'bot', text: data.question }]);
        }
    }

    useEffect(() => { init(); }, []);

    async function send() {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        const r = await fetch(`${API_BASE}/api/conversations/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, text: userMsg.text })
        });
        const data = await r.json();
        const botMsg = { role: 'bot', text: data.reply };
        setMessages(prev => [...prev, botMsg]);
    }

    async function togglePanel() {
        if (opened) {
            const hasUserMsgs = messages.some(m => m.role === 'user');
            if (hasUserMsgs && !saved) {
                const ok = window.confirm('Do u wnat to save the chat?');
                if (ok) {
                    try {
                        await saveTranscript('<bot-slug-here>', { threadKey: 'local', pageUrl: location.href, transcript: messages });
                        setSaved(true);
                    } catch (e) { console.error(e); }
                }
            }
        }
        setOpened(!opened);
    }

    return (
        <>
            {/* <button className="cb-launcher" style={{ background: brand.primaryColor }} onClick={() => setOpened(!opened)}> */}
            <button className="cb-launcher" style={{ background: brand.primaryColor }} onClick={togglePanel}>
                {brand.launcherText}
            </button>
            {opened && (
                <div className="cb-panel">
                    <div className="cb-header" style={{ background: brand.primaryColor }}>
                        {brand.title}
                    </div>
                    <div className="cb-body">
                        {messages.map((m, i) => (
                            <div key={i} className={`cb-msg ${m.role}`}>{m.text}</div>
                        ))}
                    </div>
                    <div className="cb-input">
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your answer..." />
                        <button onClick={send}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}
