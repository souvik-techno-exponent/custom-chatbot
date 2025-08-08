// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use(cors({
    origin: (origin, cb) => cb(null, true), // tighten in prod
    credentials: false
}));

// API routes
app.use('/api/bots', require('./routes/bots'));
app.use('/api/conversations', require('./routes/conversations'));

// Serve widget bundle (built assets)
app.use('/widget', express.static(path.join(__dirname, '../../widget/dist')));
app.get('/embed', (req, res) => {
    // Minimal page hosting the widget iframe app
    res.sendFile(path.join(__dirname, '../../widget/dist/index.html'));
});

// Tiny CDN endpoint for single-line script
app.get('/cb.js', (req, res) => {
    // This file can be the minified loader from widget/dist/loader.js
    res.sendFile(path.join(__dirname, '../../widget/dist/loader.js'));
});

async function start() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('')
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`DB connected & Server running on http://localhost:${port}`));
}
start();
