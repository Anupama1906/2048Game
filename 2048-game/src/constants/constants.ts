// constants.ts
import type { Level } from "../types/types";

export const WALL = 'WALL';

export const TILE_COLORS: Record<number, string> = {
    2: 'bg-orange-100 text-gray-700 dark:bg-orange-200 dark:text-gray-900',
    4: 'bg-orange-200 text-gray-700 dark:bg-orange-300 dark:text-gray-900',
    8: 'bg-orange-300 text-white dark:bg-orange-500',
    16: 'bg-orange-400 text-white dark:bg-orange-600',
    32: 'bg-orange-500 text-white dark:bg-orange-700',
    64: 'bg-orange-600 text-white dark:bg-orange-800',
    128: 'bg-yellow-400 text-white text-3xl dark:bg-yellow-600',
    256: 'bg-yellow-500 text-white text-3xl dark:bg-yellow-700',
    512: 'bg-yellow-600 text-white text-3xl dark:bg-yellow-800',
    1024: 'bg-yellow-700 text-white text-2xl dark:bg-yellow-900',
    2048: 'bg-yellow-800 text-white text-2xl dark:bg-yellow-950',
};

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
            [2, 2, 4, 8],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        thinWalls: {
            vertical: [[0, 0]],    // Wall between the first two '2's
            horizontal: [[0, 2]]   // Wall below the '4'
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
            [4, 4, 0, 4],
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
    }
];