// conversations.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Bot = require('../models/Bot');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

function domainFromUrl(url = '') {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

// Widget init: validate token, domain allowlist, restore/create session
router.post('/init', async (req, res) => {
    const { embedToken, anonUserToken, pageURL } = req.body;

    let payload;
    try {
        payload = jwt.verify(embedToken, process.env.EMBED_TOKEN_SECRET);
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const bot = await Bot.findById(payload.botId);
    if (!bot || !bot.published) return res.status(404).json({ error: 'Bot unavailable' });

    const host = domainFromUrl(pageURL);
    if (bot.allowlistedDomains.length && !bot.allowlistedDomains.includes(host)) {
        return res.status(403).json({ error: 'Domain not allowlisted' });
    }

    // Restore or create conversation
    let convo = await Conversation.findOne({ botId: bot._id, anonUserToken });
    if (!convo) {
        convo = await Conversation.create({ botId: bot._id, anonUserToken, pageOrigins: [host] });
    } else if (host && !convo.pageOrigins.includes(host)) {
        convo.pageOrigins.push(host);
        await convo.save();
    }

    // first question
    const qIndex = convo.lastQuestionIndex || 0;
    const question = bot.questions[qIndex] || null;

    res.json({
        conversationId: convo._id.toString(),
        question,
        brand: bot.brand
    });
});

// User message: store + advance the 5 static questions
router.post('/message', async (req, res) => {
    const { conversationId, text } = req.body;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    const bot = await Bot.findById(convo.botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    // persist user message
    await Message.create({ conversationId, role: 'user', text });

    let qIndex = convo.lastQuestionIndex || 0;
    const nextIndex = qIndex + 1;

    // If next question exists, send it; else finalize
    if (nextIndex < bot.questions.length) {
        convo.lastQuestionIndex = nextIndex;
        await convo.save();

        const nextQ = bot.questions[nextIndex];
        await Message.create({ conversationId, role: 'bot', text: nextQ });

        return res.json({ done: false, reply: nextQ });
    } else {
        convo.done = true;
        await convo.save();

        const closing = 'Thanks! We have collected your responses. We will get back to you shortly.';
        await Message.create({ conversationId, role: 'bot', text: closing });

        return res.json({ done: true, reply: closing });
    }
});

module.exports = router;
