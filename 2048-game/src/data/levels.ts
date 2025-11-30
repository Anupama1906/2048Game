// src/data/levels.ts
import type { Level, StationaryCell } from "../types/types";

// --- HELPERS ---

// Short helper for Stationary tiles
const S = (val: number): StationaryCell => ({ type: 'stationary', value: val });

// Helper to define a section. 
// It automatically adds the "section" property to every level in the list.
const createSection = (sectionName: string, levels: Omit<Level, 'section'>[]): Level[] => {
    return levels.map(level => ({
        ...level,
        section: sectionName
    }));
};

// --- SECTIONS ---

const BASICS = createSection("Basics", [
    {
        id: 'basics-1',
        target: 4,
        name: "The Basics",
        description: "Combine the 2s to reach 4. Use arrows to move tiles.",
        grid: [
            [2, 0],
            [0, 2],
        ]
    },
    {
        id: 'basics-2',
        target: 16,
        name: "The Cross",
        description: "Merge similar numbers to reach the desired target.",
        grid: [
            [2, 0, 0, 2],
            [0, 2, 2, 0],
            [0, 2, 2, 0],
            [2, 0, 0, 2],
        ]
    },
    {
        id: 'basics-3',
        target: 2048,
        name: "Chain",
        description: "Merge numbers to reach larger numbers.",
        grid: [
            [2, 2, 4, 8],
            ["W", "W", "W", 16],
            [1024, "W", "W", 32],
            [512, 256, 128, 64]
        ]
    },
]);

const STRATEGIES = createSection("Strategies", [
    {
        id: 'strat-1',
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
        id: 'strat-2',
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
    }
]);

const CHALLENGES = createSection("Challenges", [
    {
        id: 'chall-1',
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
        id: 'chall-2',
        target: 128,
        name: "The Maze",
        description: "Navigate the walls carefully.",
        grid: [
            [32, 'W', 64, 0],
            [32, 'W', 0, 0],
            [0, 0, 'W', 0],
            [0, 0, 0, 0]
        ]
    }
]);

const EXPERT = createSection("Expert", [
    {
        id: 'expert-1',
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
]);

const MECHANICS = createSection("Mechanics", [
    {
        id: 'mech-1',
        target: 32,
        name: "Sticky Situation",
        description: "Pinned tiles (with dots) won't move until you merge them.",
        grid: [
            [S(2), 0, 0, S(2)],
            [0, 4, 4, 0],
            [0, 0, 0, 0],
            [S(8), 0, 0, S(8)]
        ]
    }
]);

// --- EXPORT ---
// Combine all sections here. The order here determines the order in the menu.
export const INITIAL_LEVELS: Level[] = [
    ...BASICS,
    ...STRATEGIES,
    ...CHALLENGES,
    ...EXPERT,
    ...MECHANICS
];