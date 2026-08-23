import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import Generation from "../models/Generation.js";
import jwt from "jsonwebtoken";

// Lazy initialization of Gemini client
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing from environment variables");
    return new GoogleGenerativeAI(apiKey);
};

// Lazy initialization of Groq client
const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing from environment variables");
    return new Groq({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are VibeText, a linguistic expert specializing in regional dialects and social vibes.
Your task is to rewrite the provided [TEXT] into the [DIALECT] style, AND generate a descriptive image prompt representing this vibe.

RULES:
1. Preserve the original meaning and sentiment exactly in the rewritten text.
2. Adapt vocabulary, slang, idioms, and grammatical quirks specific to the dialect.
3. Generate an 'imagePrompt' that is a highly visual, detailed English description representing the situation and vibe. It should be suitable for an AI image generator.
4. You MUST return your response as a valid JSON object with EXACTLY two keys: "text" and "imagePrompt". DO NOT return markdown blocks, just raw JSON.
`;

const isRateLimitError = (err) => {
    const msg = err?.message || '';
    return msg.includes('429') || msg.includes('quota') || msg.includes('Quota') || msg.includes('Too Many Requests') || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand');
};

// ── Primary: Gemini ─────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(`${SYSTEM_INSTRUCTION}\n${prompt}`);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
};

// ── Fallback: Groq (Llama-3.3-70b) ──────────────────────────────────────────
const callGroq = async (prompt) => {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.85,
    });
    const raw = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
};

export const generateContent = async (req, res) => {
    try {
        const { text, dialect, intensity } = req.body;

        if (!text || !dialect) {
            return res.status(400).json({ error: "Both 'text' and 'dialect' are required" });
        }

        // Try to extract user ID from auth token if present (public endpoint)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (_) { /* anonymous */ }
        }

        const prompt = `[TEXT]: "${text}"\n[DIALECT]: "${dialect}"\n${intensity ? `[INTENSITY]: "${intensity}"` : ""}`;

        // ── Waterfall: Gemini → Groq ─────────────────────────────────────────
        let parsed;
        let provider = 'gemini';
        try {
            parsed = await callGemini(prompt);
        } catch (geminiErr) {
            if (isRateLimitError(geminiErr)) {
                console.warn('[VibeText] Gemini quota hit — falling back to Groq...');
                provider = 'groq';
                parsed = await callGroq(prompt);
            } else {
                throw geminiErr; // re-throw non-rate-limit errors
            }
        }

        console.log(`[VibeText] Content generated via: ${provider}`);

        // Log generation in background (non-blocking)
        Generation.create({ userId, vibe: dialect, intensity: Number(intensity || 5) })
            .catch(err => console.error("Failed to log generation:", err));

        // Build image URL via proxy
        const optimizedPrompt = `${parsed.imagePrompt}, cinematic lighting, highly detailed, aesthetic`;
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const baseUrl = `${protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/api/image-proxy?prompt=${encodeURIComponent(optimizedPrompt)}`;

        res.status(200).json({ content: parsed.text, imageUrl });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
    }
};

export const proxyImage = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) return res.status(400).json({ error: "prompt is required" });
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=400&nologo=true`;

        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error("Failed to fetch image from Pollinations");

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(buffer);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Failed to proxy image" });
    }
};
