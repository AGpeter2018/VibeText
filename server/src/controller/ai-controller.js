import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy initialization of Gemini client
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from environment variables");
    }
    return new GoogleGenerativeAI(apiKey);
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

export const generateContent = async (req, res) => {
    try {
        const { text, dialect, intensity } = req.body;

        if (!text || !dialect) {
            return res.status(400).json({ error: "Both 'text' and 'dialect' are required" });
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `${SYSTEM_INSTRUCTION}
        
[TEXT]: "${text}"
[DIALECT]: "${dialect}"
${intensity ? `[INTENSITY]: "${intensity}"` : ""}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text().replace(/```json|```/g, '').trim();
        
        const parsed = JSON.parse(generatedText);
        
        // Point to our own proxy endpoint to avoid CORS 403 errors from the browser
        const optimizedPrompt = `${parsed.imagePrompt}, cinematic lighting, highly detailed, aesthetic`;
        const baseUrl = req.protocol + '://' + req.get('host');
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
