// src/data/levels.ts
import type { Level, StationaryCell } from "../types/types";

// Helper for defining levels locally
const S = (val: number): StationaryCell => ({ type: 'stationary', value: val });

export const INITIAL_LEVELS: Level[] = [
    {
        id: 1,
        section: "Basics",
        target: 4,
        name: "The Basics",
        description: "Combine the 2s and 4s to reach 8.",
        grid: [
            [2, 0],
            [0, 2],
        ]
    },
    {
        id: 2,
        section: "Basics",
        target: 2048,
        name: "Maze",
        description: "Chain merges together.",
        grid: [
            [2, 2, 4, 8],
            ["W", "W", "W", 16],
            [1024, "W", "W", 32],
            [512, 256, 128, 64]
        ]
    },
    {
        id: 3,
        section: "Strategies",
        target: 16,
        name: "The Corridor",
        description: "Walls block your movement. Plan ahead.",
        grid: [
            ['W', 0, 0, 'W'],
            [4, 2, 2, 4],
            ['W', 0, 0, 'W'],
            [0, 4, 4, 0]
        ]
    },
    {
        id: 4,
        section: "Strategies",
        target: 32,
        name: "Cornered",
        description: "Get the 32. Don't get stuck in the corners.",
        grid: [
            [2, 2, 4, 8, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        thinWalls: {
            vertical: [[0, 0]],
            horizontal: [[0, 2]]
        }
    },
    {
        id: 5,
        section: "Challenges",
        target: 64,
        name: "Split Brain",
        description: "Merge across the divide.",
        grid: [
            [16, 0, 'W', 16],
            [8, 0, 'W', 8],
            [4, S(4), 0, 4],
            [0, 0, 0, 4]
        ]
    },
    {
        id: 6,
        section: "Challenges",
        target: 128,
        name: "The Maze",
        description: "Navigate the walls carefully.",
        grid: [
            [32, 'W', 64, 0],
            [32, 'W', 0, 0],
            [0, 0, 'W', 0],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 7,
        section: "Expert",
        target: 2048,
        name: "Impossible?",
        description: "The ultimate challenge.",
        grid: [
            [1024, 512, 256, 128],
            [0, 0, 0, 64],
            [0, 0, 0, 32],
            ['W', 'W', 'W', 32]
        ]
    },
    {
        id: '3',
        section: "Mechanics",
        target: 32,
        name: "Sticky Situation",
        description: "Pinned tiles (with dots) won't move until you merge them.",
        grid: [
            [S(2), 0, 0, S(2)],
            [0, 4, 4, 0],
            [0, 0, 0, 0],
            [S(8), 0, 0, S(8)]
        ]
    },
];