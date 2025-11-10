export type BotUI = {
    appearance: {
        brandColor: string; accentColor: string; background?: string; surface?: string;
        textPrimary?: string; textSecondary?: string; font?: string; mode?: "light" | "dark" | "auto";
        borderRadius?: number;
    };
    layout: {
        position?: "bottom-right" | "bottom-left" | "floating" | "inline";
        width?: number; height?: number; maxWidth?: number; showHeader?: boolean; headerHeight?: number;
    };
    messaging: {
        displayName?: string; welcomeText?: string; inputPlaceholder?: string;
        showTypingIndicator?: boolean; typingDelayMs?: number; bubbleShape?: "rounded" | "pill" | "square";
        bubblePadding?: number; showTimestamps?: boolean; microcopy?: { sendText?: string };
    };
};
export type Bot = {
    name: string; slug: string; brandColor: string; welcomeText: string;
    ui?: Partial<BotUI>; questions: string[];
};
export type ThreadMessage = { role: "assistant" | "user"; text: string; ts: number };
