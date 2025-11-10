import { Router } from 'express';
import { Thread } from '../models/Thread.js';
import { Bot } from '../models/Bot.js';

const router = Router();

// GET bootstrap: do NOT create any DB record. Just return bot & questions.
router.get('/:botSlug/thread', async (req, res) => {
    try {
        const { botSlug } = req.params;
        const { threadKey, pageUrl } = req.query;
        if (!threadKey || !pageUrl) {
            return res.status(400).json({ error: 'threadKey and pageUrl are required' });
        }

        const bot = await Bot.findOne({ slug: botSlug });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        // no DB writes – client will render first question locally
        res.json({ bot, questions: bot.questions || [] });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to bootstrap thread' });
    }
});
// POST next-step: stateless. No DB writes. Compute next question from answersCount.
router.post('/:botSlug/thread', async (req, res) => {
    try {
        const { botSlug } = req.params;
        const { answersCount } = req.body || {};
        // answersCount = how many user answers have been given so far (including current one)
        if (typeof answersCount !== 'number' || answersCount < 0) {
            return res.status(400).json({ error: 'answersCount is required and must be >= 0' });
        }

        const bot = await Bot.findOne({ slug: botSlug });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        const nextQuestion = bot.questions[answersCount] || null;
        res.json({ nextQuestion });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to compute next question' });
    }
});

// POST save: only when user explicitly consents, persist the full transcript once.
router.post('/:botSlug/save', async (req, res) => {
    try {
        const { botSlug } = req.params;
        const { threadKey, pageUrl, transcript } = req.body || {};
        if (!threadKey || !pageUrl || !Array.isArray(transcript)) {
            return res.status(400).json({ error: 'threadKey, pageUrl and transcript[] are required' });
        }

        const bot = await Bot.findOne({ slug: botSlug });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        // Upsert on (botSlug, threadKey, pageUrl) – overwrite any previous save for same session
        const doc = await Thread.findOneAndUpdate(
            { botSlug, threadKey, pageUrl },
            {
                botSlug,
                threadKey,
                pageUrl,
                messages: transcript.map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    text: String(m.text || ''),
                    ts: m.ts ? new Date(m.ts) : new Date()
                }))
            },
            { new: true, upsert: true }
        );
        res.json({ ok: true, saved: true, threadId: doc._id.toString() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save transcript' });
    }
});
export default router;
