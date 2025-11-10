import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    TextField,
    IconButton,
    Paper,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { bootstrap, nextQuestion, saveTranscript } from "./api.js";


// Parse query params set by embed script
function useParams() {
    return useMemo(() => Object.fromEntries(new URLSearchParams(window.location.search)), []);
}

export default function App() {
    const { bot: botSlug, thread: threadKey, page: pageUrl } = useParams();
    const [bot, setBot] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [askSaveOpen, setAskSaveOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const chatRef = useRef(null);
    const bootedRef = useRef(false);
    const [isTyping, setIsTyping] = useState(false);

    // 1) Run bootstrap ONCE per slug/thread/page change
    useEffect(() => {
        const bootKey = `${botSlug}::${threadKey}::${pageUrl}`;
        if (bootedRef.current === bootKey) return; // already bootstrapped for this key
        bootedRef.current = bootKey;

        async function init() {
            const { bot, questions } = await bootstrap(botSlug, threadKey, pageUrl);
            setBot(bot);
            const ui = bot.ui || {};
            // Apply CSS variables / mode / font
            const root = document.documentElement;
            root.style.setProperty("--cb-brand", ui.appearance?.brandColor || bot.brandColor || "#1976d2");
            root.style.setProperty("--cb-accent", ui.appearance?.accentColor || "#42a5f5");
            root.style.setProperty("--cb-bg", ui.appearance?.background || "#fafafa");
            root.style.setProperty("--cb-surface", ui.appearance?.surface || "#ffffff");
            root.style.setProperty("--cb-text", ui.appearance?.textPrimary || "#111111");
            root.style.setProperty("--cb-text-secondary", ui.appearance?.textSecondary || "#666666");
            root.style.setProperty("--cb-radius", (ui.appearance?.borderRadius ?? 12) + "px");
            if (ui.appearance?.font && ui.appearance.font !== "system") {
                root.style.setProperty("--cb-font", `${ui.appearance.font}, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`);
            }
            const mode = ui.appearance?.mode || "light";
            if (mode === "dark") document.body.classList.add("cb-dark");
            else document.body.classList.remove("cb-dark");

            // Seed messages: optional welcomeText first, then first question
            const seeded = [];
            const welcome = ui.messaging?.welcomeText || bot.welcomeText;
            if (welcome) seeded.push({ role: "assistant", text: welcome, ts: Date.now() });
            if (questions?.[0]) seeded.push({ role: "assistant", text: questions[0], ts: Date.now() });
            if (seeded.length) setMessages(seeded);
        }
        init();
    }, [botSlug, threadKey, pageUrl]);

    // 2) Handle beforeunload separately so deps can include messages/saved
    useEffect(() => {
        const onBeforeUnload = (e) => {
            const hasUserMsgs = messages.some((m) => m.role === "user");
            if (!saved && hasUserMsgs) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [messages, saved]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    async function onSend() {
        const text = input.trim();
        if (!text) return;
        setInput("");

        // compute how many user answers there will be *after* this send
        const answersCount = messages.filter((m) => m.role === "user").length + 1;

        // append the user's message
        setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);

        try {
            const typingDelay = bot?.ui?.messaging?.typingDelayMs ?? 500;
            const showTyping = bot?.ui?.messaging?.showTypingIndicator ?? true;
            if (showTyping) {
                setIsTyping(true);
                await new Promise((r) => setTimeout(r, typingDelay));
            }
            const { nextQuestion: nq } = await nextQuestion(botSlug, answersCount);
            if (nq) {
                setMessages((prev) => [...prev, { role: "assistant", text: nq, ts: Date.now() }]);
            } else {
                setAskSaveOpen(true);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsTyping(false);
        }
    }

    async function handleSaveConsent(ok) {
        setAskSaveOpen(false);
        if (!ok) return;
        try {
            await saveTranscript(botSlug, { threadKey, pageUrl, transcript: messages });
            setSaved(true);
        } catch (e) {
            console.error(e);
            // optionally show a toast
        }
    }

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "var(--cb-bg)" }}>
            {(bot?.ui?.layout?.showHeader ?? true) && (
                <AppBar position="static" sx={{ bgcolor: "var(--cb-brand)" }}>
                    <Toolbar sx={{ minHeight: (bot?.ui?.layout?.headerHeight ?? 56) + "px" }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {bot?.ui?.messaging?.displayName || bot?.name || "Assistant"}
                        </Typography>
                        {saved && (
                            <Typography variant="caption" sx={{ ml: 2, opacity: 0.85 }}>
                                Transcript saved
                            </Typography>
                        )}
                    </Toolbar>
                </AppBar>
            )}

            <Box ref={chatRef} sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {messages.map((m, i) => (
                    <Paper
                        key={i}
                        sx={{
                            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                            p: (bot?.ui?.messaging?.bubblePadding ?? 10) / 10 + 1,
                            maxWidth: "80%",
                            bgcolor: m.role === "user" ? "var(--cb-accent)" : "var(--cb-surface)",
                            color: "var(--cb-text)",
                            borderRadius: (() => {
                                const shape = bot?.ui?.messaging?.bubbleShape || "rounded";
                                const r = `var(--cb-radius)`;
                                if (shape === "pill") return 9999;
                                if (shape === "square") return 4;
                                return r;
                            })(),
                        }}
                        elevation={1}
                    >
                        <Typography variant="body2" sx={{ color: "var(--cb-text)" }}>
                            {m.text}
                        </Typography>
                        {(bot?.ui?.messaging?.showTimestamps ?? true) && (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {new Date(m.ts).toLocaleTimeString()}
                            </Typography>
                        )}
                    </Paper>
                ))}
                {isTyping && (bot?.ui?.messaging?.showTypingIndicator ?? true) && (
                    <Typography variant="body2" sx={{ opacity: 0.7, ml: 1 }}>
                        …typing
                    </Typography>
                )}
            </Box>

            <Box sx={{ p: 1, borderTop: "1px solid #eee" }}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={bot?.ui?.messaging?.inputPlaceholder || "Type your answer..."}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSend();
                        }}
                    />
                    <IconButton
                        sx={{ bgcolor: "var(--cb-brand)", color: "#fff", "&:hover": { opacity: 0.9 } }}
                        onClick={onSend}
                        aria-label={bot?.ui?.messaging?.microcopy?.sendText || "Send"}
                    >
                        <SendIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* Consent dialog */}
            <Dialog open={askSaveOpen} onClose={() => handleSaveConsent(false)}>
                <DialogTitle>Save chat?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">Do you want to save the chat?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleSaveConsent(false)}>No</Button>
                    <Button onClick={() => handleSaveConsent(true)} variant="contained">
                        Yes, save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
