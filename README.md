# Custom ChatBot

This repository contains a minimal MERN‑stack chatbot platform. It lets you:

- Create bots with a brand configuration and five static questions.
- Publish a bot to generate a single `<script>` tag that can be dropped into any site.
- Serve a lightweight widget that asks the stored questions and records responses.

## Running locally

1. **Install dependencies**
   ```bash
   cd BE && npm install
   cd ../vit && npm install
   ```

2. **Build the widget bundle**
   ```bash
   cd vit
   npm run build
   ```
   The compiled files are output to `vit/dist/`.

3. **Start the backend**
   ```bash
   cd ../BE
   MONGO_URI=mongodb://localhost:27017/chatbot \
   EMBED_TOKEN_SECRET=dev \
   CDN_BASE=http://localhost:4000 \
   node src/index.js
   ```
   The API and widget script are now served at `http://localhost:4000`.

## Embedding a bot

Use the admin pages (from the Vite dev server or your own UI) to create and publish a bot. Publishing returns a snippet such as:

```html
<script src="http://localhost:4000/cb.js" data-bot="TOKEN" async></script>
```

Dropping this tag into any webpage loads an iframe pointing to `/embed`, and the chat widget walks the visitor through the five questions defined in `BE/src/models/Bot.js`.

