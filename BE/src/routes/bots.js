// bots.js
const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const { signEmbedPayload } = require('../utils/signer');

router.post('/', async (req, res) => {
    // Create bot
    const bot = await Bot.create({
        ...req.body,
        tenantId: req.user?.tenantId || 'demo',
        createdBy: req.user?.id || 'demo'
    });
    res.json(bot);
});

router.get('/', async (req, res) => {
    const bots = await Bot.find({ tenantId: req.user?.tenantId || 'demo' }).sort('-createdAt');
    res.json(bots);
});

router.post('/:id/publish', async (req, res) => {
    const { id } = req.params;
    const { allowlistedDomains } = req.body;

    const bot = await Bot.findByIdAndUpdate(id, {
        published: true,
        allowlistedDomains: allowlistedDomains || [],
        $inc: { version: 1 }
    }, { new: true });

    // Signed token for the client widget (no secrets, just references)
    const token = signEmbedPayload(
        { botId: bot._id.toString(), version: bot.version },
        process.env.EMBED_TOKEN_SECRET
    );

    // single-line script tag for host sites
    const script = `<script src="${process.env.CDN_BASE}/cb.js" data-bot="${token}" async></script>`;
    res.json({ bot, embedScript: script });
});

router.get('/:id/script', async (req, res) => {
    // convenience endpoint to fetch the latest script
    const bot = await Bot.findById(req.params.id);
    if (!bot || !bot.published) return res.status(404).json({ error: 'Bot not published' });
    const token = signEmbedPayload(
        { botId: bot._id.toString(), version: bot.version },
        process.env.EMBED_TOKEN_SECRET
    );
    const script = `<script src="${process.env.CDN_BASE}/cb.js" data-bot="${token}" async></script>`;
    res.json({ embedScript: script });
});

module.exports = router;
