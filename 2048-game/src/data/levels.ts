import type { Level, StationaryCell } from "../types/types";

// --- HELPERS ---
const S = (val: number): StationaryCell => ({ type: 'stationary', value: val });

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
        name: "First Steps",
        description: "Combine the 2s to reach 4. Use arrows to move tiles.",
        par: 2, // Easy: Just 1 move needed
        grid: [
            [2, 0],
            [0, 2],
        ]
    },
    {
        id: 'basics-2',
        target: 16,
        name: "Merge Away",
        description: "Merge similar numbers to reach the desired target.",
        par: 6, // Challenge: Do it efficiently
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
        par: 4,
        grid: [
            [2, 2, 4, 8],
            ["W", "W", "W", 16],
            [1024, "W", "W", 32],
            [512, 256, 128, 64]
        ]
    },
    {
        id: 'basics-4',
        target: 32,
        name: "Combinations",
        description: "Try to reach the goal with few moves.",
        par: 10,
        grid: [
            [2, 4, 4, 2],
            [2, 4, 4, 2],
            [4, 2, 2, 4],
            [4, 2, 2, 4],
        ]
    },
]);

const STRATEGIES = createSection("Strategies", [
    {
        id: 'strat-1',
        target: 16,
        name: "The Corridor",
        description: "Plan Carefully. Use undo if you got stuck.",
        par: 8,
        grid: [
            ['W', 0, 0, 'W'],
            [4, 2, 2, 4],
            ['W', 0, 0, 'W'],
            [0, 4, 4, 0]
        ]
    },
    {
        id: 'strat-2',
        target: 16,
        name: "Cornered",
        description: "Order matters.",
        par: 5,
        grid: [
            [2, 2, 0, 2],
            [8, 2, 'W', 'W'],
            [0, 'W', 'W', 'W'],
            [0, 'W', 'W', 'W']
        ],

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
        ],
        thinWalls: {
            vertical: [[0, 0]],
            horizontal: [[0, 2]]
        }
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

export const INITIAL_LEVELS: Level[] = [
    ...BASICS,
    ...STRATEGIES,
    ...CHALLENGES,
    ...EXPERT,
    ...MECHANICS
];