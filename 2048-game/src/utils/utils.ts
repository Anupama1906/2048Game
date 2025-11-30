// src/utils/utils.ts
import type { Grid, Level } from '../types/types';
import { WALL } from '../constants/constants';

// Use environment variable for API key (Vite standard)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export const cloneGrid = (grid: Grid): Grid => grid.map(row => [...row]);

export const createWallMap = (walls: [number, number][] | undefined, size: number): boolean[][] => {
    const map = Array(size).fill(null).map(() => Array(size).fill(false));
    walls?.forEach(([r, c]) => { if (r < size && c < size) map[r][c] = true; });
    return map;
};

// FIXED: Now accepts thinWalls to check for blockage correctly
export const canMove = (grid: Grid, thinWalls?: Level['thinWalls']): boolean => {
    const size = grid.length;

    // Create quick lookup maps for walls
    const vWalls = createWallMap(thinWalls?.vertical, size);
    const hWalls = createWallMap(thinWalls?.horizontal, size);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const current = grid[r][c];
            if (current === 0) return true; // Empty spot means we can move
            if (current === WALL) continue;

            // Check Right
            if (c < size - 1) {
                // If there is NO vertical wall between current and right
                if (!vWalls[r][c]) {
                    const right = grid[r][c + 1];
                    if (right === current || right === 0) return true;
                }
            }

            // Check Down
            if (r < size - 1) {
                // If there is NO horizontal wall between current and down
                if (!hWalls[r][c]) {
                    const down = grid[r + 1][c];
                    if (down === current || down === 0) return true;
                }
            }
        }
    }
    return false;
};

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

export const rotateWalls = (vWalls: boolean[][], hWalls: boolean[][], size: number) => {
    const newV = Array(size).fill(null).map(() => Array(size).fill(false));
    const newH = Array(size).fill(null).map(() => Array(size).fill(false));

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (vWalls[r][c]) {
                const newR = (size - 2) - c;
                const newC = r;
                if (newR >= 0) newH[newR][newC] = true;
            }
            if (hWalls[r][c]) {
                const newR = (size - 1) - c;
                const newC = r;
                if (newR >= 0) newV[newR][newC] = true;
            }
        }
    }
    return { v: newV, h: newH };
};