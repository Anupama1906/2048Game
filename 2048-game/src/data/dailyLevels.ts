// src/data/dailyLevels.ts
import type { Level, StationaryCell, GeneratorCell } from "../types/types";

// Helper functions (re-defined here to keep this file self-contained)
const S = (val: number): StationaryCell => ({ type: 'stationary', value: val });
const G = (val: number): GeneratorCell => ({ type: 'generator', value: val });

export const DAILY_LEVELS: Level[] = [
    {
        id: 'daily-1',
        target: 32,
        name: "Morning Coffee",
        description: "A quick puzzle to start your day.",
        par: 6,
        grid: [
            [2, 4, 0, 0],
            [0, 2, 8, 0],
            [0, 0, 16, 0],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 'daily-2',
        target: 64,
        name: "Daily Twist",
        description: "Watch out for the walls.",
        par: 8,
        grid: [
            [4, 0, 0, 4],
            [0, "W", "W", 0],
            [0, "W", "W", 0],
            [8, 0, 0, 8]
        ]
    },
    {
        id: 'daily-3',
        target: 128,
        name: "Wednesday Wall",
        description: "Use the center pillar to your advantage.",
        par: 12,
        grid: [
            [2, 2, 4, 4],
            [2, "W", "W", 4],
            [8, "W", "W", 8],
            [8, 8, 16, 16]
        ]
    },
    // Add more daily levels here...
];