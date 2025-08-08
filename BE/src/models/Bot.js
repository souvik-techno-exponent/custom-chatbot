// Bot.js
const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
    tenantId: { type: String, index: true },
    name: { type: String, required: true },
    questions: {
        type: [String], default: [
            "What's your name?",
            "What's your email?",
            "What are you looking for?",
            "What's your budget range?",
            "When do you want to start?"
        ]
    },
    brand: {
        primaryColor: { type: String, default: '#1976d2' },
        title: { type: String, default: 'Assistant' },
        launcherText: { type: String, default: 'Chat' }
    },
    allowlistedDomains: { type: [String], default: [] }, // e.g. ["example.com", "another.com"]
    published: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    createdBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Bot', BotSchema);
