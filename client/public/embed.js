// DEV mode: point to Vite dev server for widget
/**
 * Simple embed script (no config needed beyond data-bot-slug).
 * Usage (DEV):
 * <script src="http://localhost:5173/embed.js" data-bot-slug="YOUR_BOT_SLUG"></script>
 *
 * It injects a floating button and an iframe panel that loads the widget.
 * Conversation is anonymous; a local threadKey is stored in localStorage per (botSlug + pageHost).
 */
(function () {
    // Resolve widget URL without hardcoding:
    // - If data-widget-url is provided, use it as-is (absolute URL).
    // - Else build from (origin of this script) + (data-widget-path or default).
    const currentScript = document.currentScript;
    const scriptOrigin = new URL(currentScript.src).origin;
    const widgetUrlAttr = currentScript.getAttribute('data-widget-url');
    const widgetOriginAttr = currentScript.getAttribute('data-widget-origin'); // optional override
    const widgetPathAttr = currentScript.getAttribute('data-widget-path') || '/chat-bot/index.html';

    const WIDGET_URL = widgetUrlAttr
        ? widgetUrlAttr
        : `${widgetOriginAttr || scriptOrigin}${widgetPathAttr}`;

    const botSlug = (currentScript && currentScript.getAttribute('data-bot-slug')) || '';
    if (!botSlug) {
        console.error('[Embed] data-bot-slug is required');
        return;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '2147483647';
    document.body.appendChild(container);

    const button = document.createElement('button');
    button.innerText = 'Chat';
    button.style.padding = '10px 16px';
    button.style.borderRadius = '9999px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
    button.style.background = '#1976d2';
    button.style.color = '#fff';
    container.appendChild(button);

    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '80px';
    panel.style.right = '20px';
    panel.style.width = '380px';
    panel.style.height = '560px';
    panel.style.maxWidth = '95vw';
    panel.style.maxHeight = '80vh';
    panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    panel.style.borderRadius = '16px';
    panel.style.overflow = 'hidden';
    panel.style.display = 'none';
    container.appendChild(panel);

    const iframe = document.createElement('iframe');
    iframe.title = 'Chatbot';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    panel.appendChild(iframe);

    function getThreadKey() {
        try {
            const host = location.host;
            const keyName = `poc_thread_${botSlug}_${host}`;
            let key = localStorage.getItem(keyName);
            if (!key) {
                key = 't-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
                localStorage.setItem(keyName, key);
            }
            return key;
        } catch {
            // If localStorage blocked, fallback to ephemeral key per open
            return 't-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        }
    }

    button.addEventListener('click', () => {
        const visible = panel.style.display === 'block';
        panel.style.display = visible ? 'none' : 'block';
        if (!visible) {
            const threadKey = getThreadKey();
            const pageUrl = location.href;
            const src = `${WIDGET_URL}?bot=${encodeURIComponent(botSlug)}&thread=${encodeURIComponent(threadKey)}&page=${encodeURIComponent(pageUrl)}`;
            if (iframe.src !== src) iframe.src = src;
        }
    });
})();
