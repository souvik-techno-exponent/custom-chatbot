// Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    role: { type: String, enum: ['bot', 'user'], required: true },
    text: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
