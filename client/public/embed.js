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
    if (!currentScript) {
        console.error("[Embed] Unable to locate current <script> tag.");
        return;
    }
    const scriptOrigin = new URL(currentScript.src).origin;
    const widgetUrlAttr = currentScript.getAttribute("data-widget-url");
    const widgetOriginAttr = currentScript.getAttribute("data-widget-origin"); // optional override
    const widgetPathAttr = currentScript.getAttribute("data-widget-path") || "/chat-bot/index.html";

    const WIDGET_URL = widgetUrlAttr ? widgetUrlAttr : `${widgetOriginAttr || scriptOrigin}${widgetPathAttr}`;

    // REQUIRED: bot slug for this embed
    const botSlug = (currentScript.getAttribute("data-bot-slug") || "").trim();
    const apiBase = currentScript.getAttribute("data-api-base") || ""; // e.g. http://localhost:4000/api
    if (!botSlug) {
        console.error("[Embed] data-bot-slug is required");
        return;
    }

    // state from server (optional)
    let remoteUI = null;
    async function loadUI() {
        if (!apiBase) return null;
        try {
            const r = await fetch(`${apiBase}/bots/${botSlug}`);
            if (!r.ok) return null;
            const bot = await r.json();
            return bot.ui || null;
        } catch {
            return null;
        }
    }

    // Defer DOM ops until <body> is ready
    function onBodyReady(cb) {
        if (document.body) cb();
        else document.addEventListener("DOMContentLoaded", cb, { once: true });
    }

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "2147483647";
    onBodyReady(() => document.body.appendChild(container));

    const button = document.createElement("button");
    button.innerText = "Chat";
    button.style.padding = "10px 16px";
    button.style.borderRadius = "9999px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";
    button.style.background = "#1976d2";
    button.style.color = "#fff";
    container.appendChild(button);

    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
    panel.style.borderRadius = "16px";
    panel.style.overflow = "hidden";
    panel.style.display = "none";
    container.appendChild(panel);

    const iframe = document.createElement("iframe");
    iframe.title = "Chatbot";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    panel.appendChild(iframe);

    function getThreadKey() {
        try {
            const host = location.host;
            const keyName = `poc_thread_${botSlug}_${host}`;
            let key = localStorage.getItem(keyName);
            if (!key) {
                key = "t-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
                localStorage.setItem(keyName, key);
            }
            return key;
        } catch {
            // If localStorage blocked, fallback to ephemeral key per open
            return "t-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        }
    }

    function applyLayout(ui) {
        const layout = (ui && ui.layout) || {};
        const pos = layout.position || "bottom-right";
        const width = layout.width || 380;
        const height = layout.height || 560;
        const maxWidth = layout.maxWidth || 420;
        // position container
        const margin = 20;
        container.style.bottom = margin + "px";
        if (pos === "bottom-left") {
            container.style.left = margin + "px";
            container.style.right = "";
        } else {
            container.style.right = margin + "px";
            container.style.left = "";
        }
        // panel size/pos
        panel.style.width = Math.min(width, window.innerWidth * 0.95) + "px";
        panel.style.height = Math.min(height, window.innerHeight * 0.8) + "px";
        panel.style.maxWidth = Math.min(maxWidth, window.innerWidth * 0.95) + "px";
        panel.style.maxHeight = "80vh";
        panel.style.bottom = margin + 60 + "px";
        if (pos === "bottom-left") {
            panel.style.left = margin + "px";
            panel.style.right = "";
        } else {
            panel.style.right = margin + "px";
            panel.style.left = "";
        }
        // brand color for launcher
        const brand = (ui && ui.appearance && ui.appearance.brandColor) || "#1976d2";
        button.style.background = brand;
    }

    button.addEventListener("click", () => {
        const visible = panel.style.display === "block";
        panel.style.display = visible ? "none" : "block";
        if (!visible) {
            const threadKey = getThreadKey();
            const pageUrl = location.href;
            const src = `${WIDGET_URL}?bot=${encodeURIComponent(botSlug)}&thread=${encodeURIComponent(threadKey)}&page=${encodeURIComponent(
                pageUrl
            )}`;
            if (iframe.src !== src) iframe.src = src;
        }
    });

    // Keep layout responsive on viewport changes
    window.addEventListener("resize", () => applyLayout(remoteUI));

    // init
    loadUI()
        .then((ui) => {
            remoteUI = ui;
            applyLayout(remoteUI);
        })
        .catch(() => applyLayout(null));
})();
