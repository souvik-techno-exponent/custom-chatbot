import { Router, Request, Response } from 'express';
import { Bot } from "../models/Bot.js";
import { QUESTION_POOL_25 } from "../data/questionPool.js";
import { Thread } from "../models/Thread.js";

const router = Router();

// Utility: pick 5 unique random questions from pool of 25
function pickFiveUnique(pool) {
    const indices = new Set();
    while (indices.size < 5) {
        indices.add(Math.floor(Math.random() * pool.length));
    }
    return Array.from(indices).map((i) => pool[i]);
}

// Create a bot (auto-pick 5 unique questions)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, brandColor, welcomeText, ui } = req.body || {};
        const questions = pickFiveUnique(QUESTION_POOL_25);
        const bot = await Bot.create((req.body ?? {}) as Partial<InstanceType<typeof Bot>>);
        res.json(bot);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Failed to create bot" });
    }
});

// List bots
router.get('/', async (_req: Request, res: Response) => {
    const bots = await Bot.find().sort({ createdAt: -1 });
    res.json(bots);
});

// Get a single bot
router.get('/:slug', async (req: Request, res: Response) => {
    const bot = await Bot.findOne({ slug: req.params.slug });
    if (!bot) return res.status(404).json({ error: "Not found" });
    res.json(bot);
});

router.delete('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const bot = await Bot.findOne({ slug });
        if (!bot) return res.status(404).json({ error: "Bot not found" });

        // Delete the bot
        await Bot.deleteOne({ slug });

        // Cascade delete: remove all threads for this bot (anonymous threads)
        await Thread.deleteMany({ botSlug: slug });

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete bot" });
    }
});

export default router;
