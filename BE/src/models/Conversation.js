// Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', index: true },
    anonUserToken: { type: String, index: true }, // widget-side random token
    userId: { type: String, default: null },      // optional identify() from host site
    lastQuestionIndex: { type: Number, default: 0 },
    done: { type: Boolean, default: false },
    pageOrigins: { type: [String], default: [] }  // track pages/domains seen
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
