import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const BotSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, default: () => nanoid() },
        brandColor: { type: String, default: '#1976d2' }, // MUI default primary
        welcomeText: { type: String, default: "Hi! I'm your assistant." },
        // Store 5 selected questions at creation time (pure random, unique)
        questions: { type: [String], default: [] }
    },
    { timestamps: true }
);

export const Bot = mongoose.model('Bot', BotSchema);
