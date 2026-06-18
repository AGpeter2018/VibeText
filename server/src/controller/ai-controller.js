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
You are VibeText, an expert linguist specializing in highly accurate regional dialects, local street slang, professional tones, and social vibes.
Your task is to rewrite the provided [TEXT] into the [VIBE] style.

CRITICAL RULES:
1. Preserve the original meaning and sentiment exactly.
2. Adapt vocabulary, slang, idioms, and sentence structures strictly specific to the requested [VIBE] (e.g. "Nigerian Gen Z", "1920s Mafia", "Corporate Executive").
3. Apply the vibe according to the [INTENSITY] level provided (1-10, where 10 is the strongest/most exaggerated application of the vibe).
4. DO NOT explain the changes. Return ONLY the rewritten text.
`;

export const generateContent = async (req, res) => {
    try {
        const { text, vibe, intensity } = req.body;

        if (!text || !vibe) {
            return res.status(400).json({ error: "Both 'text' and 'vibe' are required" });
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `${SYSTEM_INSTRUCTION}
        
        [TEXT]: "${text}"
        [VIBE]: "${vibe}"
        [INTENSITY]: "${intensity || 5}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        res.status(200).json({ content: generatedText });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
    }
};
