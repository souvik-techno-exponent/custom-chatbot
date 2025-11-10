import React, { useState } from "react";
import { createBot } from "../api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, TextField, Button, Stack, Typography } from "@mui/material";

export default function CreateBot() {
    const [name, setName] = useState("My Chatbot");
    const [brandColor, setBrandColor] = useState("#1976d2");
    const [welcomeText, setWelcomeText] = useState("Hi! I'm your assistant.");

    // NEW: UI config minimal controls
    type Mode = "light" | "dark" | "auto";
    type Position = "bottom-right" | "bottom-left" | "floating" | "inline";

    const [accentColor, setAccentColor] = useState("#42a5f5");
    const [mode, setMode] = useState<Mode>("light");
    const [position, setPosition] = useState<Position>("bottom-right");
    const [width, setWidth] = useState(380);
    const [height, setHeight] = useState(560);
    const [showHeader, setShowHeader] = useState(true);
    const [inputPlaceholder, setInputPlaceholder] = useState("Type your message...");

    const nav = useNavigate();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const bot = await createBot({
            name,
            brandColor,
            welcomeText,
            ui: {
                appearance: { brandColor, accentColor, mode },
                layout: { position, width: Number(width), height: Number(height), showHeader },
                messaging: { inputPlaceholder, welcomeText },
            },
        });
        nav(`/bots/${bot.slug}`);
    }

    return (
        <Card component="form" onSubmit={onSubmit}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Create Bot
                </Typography>
                <Stack spacing={2}>
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <TextField label="Brand Color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} helperText="e.g. #1976d2" />
                    <TextField label="Welcome Text" value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} />

                    <TextField label="Accent Color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                    <TextField
                        label="Mode (light|dark|auto)"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as Mode)}
                    />
                    <TextField
                        label="Launcher Position (bottom-right|bottom-left|floating|inline)"
                        value={position}
                        onChange={(e) => setPosition(e.target.value as Position)}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField label="Width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                        <TextField label="Height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                    </Stack>
                    <TextField label="Input Placeholder" value={inputPlaceholder} onChange={(e) => setInputPlaceholder(e.target.value)} />
                    <Stack direction="row" spacing={2}>
                        <label>
                            <input type="checkbox" checked={showHeader} onChange={(e) => setShowHeader(e.target.checked)} /> Show Header
                        </label>
                    </Stack>
                    <Button type="submit" variant="contained">
                        Create
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
