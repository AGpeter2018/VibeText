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
Your task is to rewrite the provided [TEXT] into the [DIALECT] style.

RULES:
1. Preserve the original meaning and sentiment exactly.
2. Adapt vocabulary, slang, idioms, and grammatical quirks specific to the dialect.
3. Maintain the original tone (e.g., if it's a professional email, make it a professional version of that dialect).
4. DO NOT explain the changes. Return ONLY the rewritten text.
`;

export const generateContent = async (req, res) => {
    try {
        const { text, dialect, intensity } = req.body;

        if (!text || !dialect) {
            return res.status(400).json({ error: "Both 'text' and 'dialect' are required" });
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `${SYSTEM_INSTRUCTION}
        
[TEXT]: "${text}"
[DIALECT]: "${dialect}"
${intensity ? `[INTENSITY]: "${intensity}"` : ""}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        res.status(200).json({ content: generatedText });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
    }
};
