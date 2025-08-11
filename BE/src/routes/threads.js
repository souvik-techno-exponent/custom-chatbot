import { Router } from 'express';
import { Thread } from '../models/Thread.js';
import { Bot } from '../models/Bot.js';

const router = Router();

/**
 * GET: bootstrap a thread (idempotent by botSlug + threadKey + pageUrl)
 * Returns bot info + existing thread (or creates one empty) + first question if needed
 */
router.get('/:botSlug/thread', async (req, res) => {
    try {
        const { botSlug } = req.params;
        const { threadKey, pageUrl } = req.query;

        if (!threadKey || !pageUrl) {
            return res.status(400).json({ error: 'threadKey and pageUrl are required' });
        }

        const bot = await Bot.findOne({ slug: botSlug });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        let thread = await Thread.findOne({ botSlug, threadKey, pageUrl });
        if (!thread) {
            thread = await Thread.create({ botSlug, threadKey, pageUrl, messages: [] });
        }

        // If conversation hasn't started, push first assistant question locally in client (to avoid double-push on retries)
        res.json({ bot, thread, questions: bot.questions });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to bootstrap thread' });
    }
});

/**
 * POST: append a user message; decide next assistant question based on count
 */
router.post('/:botSlug/thread', async (req, res) => {
    try {
        const { botSlug } = req.params;
        const { threadKey, pageUrl, text } = req.body || {};

        if (!threadKey || !pageUrl || !text) {
            return res.status(400).json({ error: 'threadKey, pageUrl and text are required' });
        }

        const bot = await Bot.findOne({ slug: botSlug });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        let thread = await Thread.findOne({ botSlug, threadKey, pageUrl });
        if (!thread) {
            thread = await Thread.create({ botSlug, threadKey, pageUrl, messages: [] });
        }

        // Save user message
        thread.messages.push({ role: 'user', text });
        await thread.save();

        // Determine next question based on how many user answers we have
        const userAnswers = thread.messages.filter(m => m.role === 'user').length;
        const nextQuestion = bot.questions[userAnswers] || null;

        if (nextQuestion) {
            // Save assistant message
            thread.messages.push({ role: 'assistant', text: nextQuestion });
            await thread.save();
        }

        res.json({ thread, nextQuestion });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to append message' });
    }
});

export default router;
