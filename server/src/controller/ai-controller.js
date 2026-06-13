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
You are VibeText, an expert linguist specializing in highly accurate regional dialects, local street slang, and social vibes.
Your task is to rewrite the provided [TEXT] into the [DIALECT] style, EXACTLY as it would be natively spoken by someone living in [COUNTRY].

CRITICAL RULES:
1. Preserve the original meaning and sentiment exactly.
2. The [COUNTRY] parameter is absolute. If [COUNTRY] is "Nigeria" and [DIALECT] is "Gen-Z Slang", you MUST use Nigerian Gen-Z slang/Pidgin (e.g. "omo", "sapa", "dey", "wahala"), NOT American slang (no "whip", "crib", "cooked").
3. Adapt vocabulary, slang, idioms, and sentence structures strictly specific to [COUNTRY]'s version of the [DIALECT].
4. Maintain the original tone (e.g., if it's a professional email, make it a professional version of that region's dialect).
5. DO NOT explain the changes. Return ONLY the rewritten text.
`;

export const generateContent = async (req, res) => {
    try {
        const { text, dialect,  country, intensity } = req.body;

        if (!text || !dialect) {
            return res.status(400).json({ error: "Both 'text' and 'dialect' are required" });
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `${SYSTEM_INSTRUCTION}
        
        [TEXT]: "${text}"
        [DIALECT]: "${dialect}"
        [COUNTRY]: "${country}"
        ${intensity ? `[INTENSITY]: "${intensity}"` : ""}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        res.status(200).json({ content: generatedText });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
    }
};
