import type { Level } from '../types/types';

// Use environment variable for API key (Vite standard)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// AI Call Function
export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
    if (!apiKey) {
        console.error("API Key is missing. Set VITE_GEMINI_API_KEY in your .env file.");
        return "Error: API Key missing.";
    }

    try {
        const payload: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000 }
        };
        if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Gemini API Call Failed:", error);
        return "Sorry, I couldn't connect to the AI right now.";
    }
}

// Helper to reliably extract JSON from markdown or text
export const extractJson = (text: string): string => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : "{}";
};