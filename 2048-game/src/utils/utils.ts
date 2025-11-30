// utils.ts
import type { Grid, Cell } from '../types/types'; // Adjust path if needed
import { WALL } from '../constants/constants';   // Adjust path if needed

export const cloneGrid = (grid: Grid): Grid => grid.map(row => [...row]);

export const canMove = (grid: Grid): boolean => {
    const size = grid.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const current = grid[r][c];
            if (current === 0) return true;
            if (current === WALL) continue;
            if (c < size - 1) {
                const right = grid[r][c + 1];
                if (right === current || right === 0) return true;
            }
            if (r < size - 1) {
                const down = grid[r + 1][c];
                if (down === current || down === 0) return true;
            }
        }
    }
    return false;
};

// --- Gemini API ---
const apiKey = ""; // Insert your key here

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
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

export const createWallMap = (walls: [number, number][] | undefined, size: number): boolean[][] => {
    const map = Array(size).fill(null).map(() => Array(size).fill(false));
    walls?.forEach(([r, c]) => { if (r < size && c < size) map[r][c] = true; });
    return map;
};

export const rotateWalls = (vWalls: boolean[][], hWalls: boolean[][], size: number) => {
    const newV = Array(size).fill(null).map(() => Array(size).fill(false));
    const newH = Array(size).fill(null).map(() => Array(size).fill(false));

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Old Vertical wall at (r,c) becomes Horizontal wall.
            // Logic: Vertical (r, c) separates (r,c) and (r,c+1).
            // Rotated: (N-1-c, r) and (N-2-c, r).
            // Becomes Horizontal wall below (N-2-c, r).
            if (vWalls[r][c]) {
                const newR = (size - 2) - c;
                const newC = r;
                if (newR >= 0) newH[newR][newC] = true;
            }

            // Old Horizontal wall at (r,c) becomes Vertical wall.
            // Logic: Horizontal (r,c) separates (r,c) and (r+1,c).
            // Rotated: (N-1-c, r) and (N-1-c, r+1).
            // Becomes Vertical wall right of (N-1-c, r).
            if (hWalls[r][c]) {
                const newR = (size - 1) - c;
                const newC = r;
                if (newR >= 0) newV[newR][newC] = true;
            }
        }
    }
    return { v: newV, h: newH };
};