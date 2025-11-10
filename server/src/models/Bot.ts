import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

const BotSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, default: () => nanoid() },
        brandColor: { type: String, default: "#1976d2" }, // MUI default primary
        welcomeText: { type: String, default: "Hi! I'm your assistant." },
        // Store 5 selected questions at creation time (pure random, unique)
        questions: { type: [String], default: [] },
        // NEW: Per-bot UI configuration (appearance, layout, messaging, interaction, content)
        ui: {
            appearance: {
                brandColor: { type: String, default: "#1976d2" },
                accentColor: { type: String, default: "#42a5f5" },
                background: { type: String, default: "#fafafa" },
                surface: { type: String, default: "#ffffff" },
                textPrimary: { type: String, default: "#111111" },
                textSecondary: { type: String, default: "#666666" },
                avatarType: { type: String, enum: ["image", "svg", "emoji"], default: "emoji" },
                avatarUrl: { type: String, default: "" },
                avatarShape: { type: String, enum: ["circle", "square"], default: "circle" },
                font: { type: String, default: "system" }, // 'system' | Google Font name
                fontScale: { type: String, enum: ["small", "normal", "large"], default: "normal" },
                theme: { type: String, enum: ["brand", "clean", "bubble", "minimal"], default: "brand" },
                mode: { type: String, enum: ["light", "dark", "auto"], default: "light" },
                borderRadius: { type: Number, default: 12 },
                boxShadowLevel: { type: Number, default: 2 },
            },
            layout: {
                position: { type: String, enum: ["bottom-right", "bottom-left", "floating", "inline"], default: "bottom-right" },
                width: { type: Number, default: 380 },
                height: { type: Number, default: 560 },
                maxWidth: { type: Number, default: 420 },
                compact: { type: Boolean, default: false },
                showHeader: { type: Boolean, default: true },
                headerHeight: { type: Number, default: 56 },
                showFooter: { type: Boolean, default: true },
                actions: { type: [Object], default: [] }, // {icon,label,action}
                embedMode: { type: String, enum: ["iframe", "inline", "modal"], default: "iframe" },
            },
            messaging: {
                displayName: { type: String, default: "" },
                welcomeText: { type: String, default: "" }, // override welcomeText
                inputPlaceholder: { type: String, default: "Type your message..." },
                showTypingIndicator: { type: Boolean, default: true },
                typingDelayMs: { type: Number, default: 500 },
                bubbleShape: { type: String, enum: ["rounded", "pill", "square"], default: "rounded" },
                bubblePadding: { type: Number, default: 10 },
                showTimestamps: { type: Boolean, default: true },
                showPoweredBy: { type: Boolean, default: false },
                microcopy: {
                    sendText: { type: String, default: "Send" },
                    endSessionText: { type: String, default: "End" },
                    consentLabel: { type: String, default: "Save chat" },
                },
            },
            interaction: {
                autoOpen: { type: String, enum: ["none", "on-delay", "on-scroll", "on-exit-intent"], default: "none" },
                delayMs: { type: Number, default: 0 },
                autoFocus: { type: Boolean, default: true },
                persistConversation: { type: Boolean, default: true },
                startCollapsed: { type: Boolean, default: true },
                quickReplies: { type: [Object], default: [] }, // [{label,payload}]
                pacing: { type: Number, default: 0 }, // extra delay per token/ms if needed
            },
            content: {
                enableCards: { type: Boolean, default: true },
                enableCarousels: { type: Boolean, default: true },
                allowFileUpload: { type: Boolean, default: false },
                allowStructuredForms: { type: Boolean, default: true },
                buttonLinkBehavior: {
                    openInNewTab: { type: Boolean, default: true },
                    trackClicks: { type: Boolean, default: true },
                    nofollow: { type: Boolean, default: false },
                },
                customComponents: {
                    showKnowledgeSnippet: { type: Boolean, default: false },
                    showAIExplanationToggle: { type: Boolean, default: false },
                },
            },
        },
    },
    { timestamps: true }
);

export const Bot = mongoose.model("Bot", BotSchema);
