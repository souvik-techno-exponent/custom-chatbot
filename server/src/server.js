import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { connectDB } from './db.js';
import botsRouter from './routes/bots.js';
import threadsRouter from './routes/threads.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Relaxed CORS for POC (tighten for prod)
const allow = [
    process.env.CLIENT_ADMIN_ORIGIN || 'http://localhost:5173',
    process.env.WIDGET_ORIGIN || 'http://localhost:5174'
];
app.use(cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true
}));

// Public: serve embed.js
app.use(express.static(path.join(__dirname, 'public')));

// APIs
app.use('/api/bots', botsRouter);
app.use('/api/threads', threadsRouter);

// Serve widget build in prod (optional)
app.use('/widget', express.static(path.join(__dirname, '..', '..', 'widget', 'dist')));

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log('Server running on ' + PORT)))
    .catch(err => { console.error(err); process.exit(1); });
