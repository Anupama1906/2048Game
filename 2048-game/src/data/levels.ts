// src/data/levels.ts
import type { Level, LockedCell, GeneratorCell, StickyCell } from "../types/types";

// --- HELPERS ---
const L = (val: number): LockedCell => ({ type: 'locked', value: val });
const G = (val: number): GeneratorCell => ({ type: 'generator', value: val });
const S = (val: number): StickyCell => ({ type: 'sticky', value: val });

const createSection = (sectionName: string, levels: Omit<Level, 'section'>[]): Level[] => {
    return levels.map(level => ({
        ...level,
        section: sectionName
    }));
};

// ... (Previous Sections: BASICS, STRATEGIES, CHALLENGES, EXPERT remain unchanged) ...

const BASICS = createSection("Basics", [
    {
        id: 'basics-1',
        target: 4,
        name: "First Steps",
        description: "Combine the 2s to reach 4. Use arrows to move tiles.",
        par: 2,
        grid: [
            [2, 0],
            [0, 2]
        ]
    },
    {
        id: 'basics-2',
        target: 16,
        name: "Merge",
        description: "Merge similar numbers to reach the desired target.",
        par: 6,
        grid: [
            [2, 0, 2],
            [0, 0, 0],
            [4, 0, 8]
        ]
    },
    {
        id: 'basics-3',
        target: 64,
        name: "Getting Bigger",
        description: "Try to reach the target with fewer moves ;)",
        par: 10,
        grid: [
            [4, 2, 2, 4],
            [2, 8, 8, 2],
            [2, 8, 8, 2],
            [4, 2, 2, 4]
        ]
    },
    {
        id: 'basics-4',
        target: 512,
        name: "Combinations",
        description: "Try to reach the goal with few moves.",
        par: 8,
        grid: [
            [2, 2, 4, 8],
            [2, 2, 4, 8],
            [128, 64, 32, 16],
            [128, 64, 32, 16]
        ]
    },
]);

const WALLS = createSection("Walls", [
    {
        id: 'wall-1',
        target: 4,
        name: "Turn Around",
        description: "Walls block movement.",
        par: 4,
        grid: [
            [0, 0, 0, 0, 0],
            [0, 'W', 'W', 'W', 0],
            [0, 'W', 2, 'W', 0],
            [2, 'W', 0, 'W', 0],
            ['W', 'W', 0, 0, 0]
        ]
    },
    {
        id: 'wall-2',
        target: 16,
        name: "The Corridor",
        description: "Use the open paths to merge tiles.",
        par: 4,
        grid: [
            ['W', 0, 0, 'W'],
            [4, 2, 2, 4],
            ['W', 0, 0, 'W'],
            [0, 4, 4, 0]
        ]
    },
    {
        id: 'wall-3',
        target: 16,
        name: "Cornered",
        description: "Plan Carefully. Use undo if you got stuck.",
        par: 5,
        grid: [
            [2, 2, 0, 2],
            [8, 2, 'W', 'W'],
            [0, 'W', 'W', 'W'],
            [0, 'W', 'W', 'W']
        ]
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
            [4, L(4), 0, 4],
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
            vertical: [[0, 0], [1, 0], [2, 0]],
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
            [L(2), 0, 0, L(2)],
            [0, 4, 4, 0],
            [0, 0, 0, 0],
            [L(8), 0, 0, L(8)]
        ]
    },
    {
        id: 'mech-2',
        target: 64,
        name: "Power Plant",
        description: "Generators (Factory icon) spawn new numbers when you clear the space.",
        grid: [
            [0, S(0), S(0), 0],
            [2, 'W', 'W', 2]
        ]
    }
]);

const NEGETIVITY = createSection("Negetivity", [
    {
        id: 'neg-1',
        target: -4,
        name: "Negetive Steps",
        description: "Merge negetive tiles to reach the target.",
        grid: [
            [-2, 0],
            [0, -2]
        ]
    },
    {
        id: 'neg-2',
        target: 32,
        name: "Collison",
        description: "Merge positive and negetive tiles to cancel them out!",
        grid: [
            ['W', 0, -2, 'W', 'W'],
            [16, L(2), 0, L(8), L(16)],
            ['W', 'W', -8, 0, 'W']
        ],
        thinWalls: {
            vertical: [],
            horizontal: [[0, 2], [1, 2]]
        }
    },
    {
        id: 'neg-3',
        target: 8,
        name: "Antimatter",
        description: "Blue tiles are negative. Merge +2 and -2 to cancel them out!",
        grid: [
            [2, -2, 0, 0],
            [-4, 4, 0, 0],
            [2, 2, -4, 0],
            [0, 0, 0, 0]
        ]
    }
]);
const MISCELLANEOUS = createSection("Miscellaneous", [
    {
        id: 'misc-1',
        target: 4,
        name: "Frozen Lake",
        description: "Merge and win ;)",
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 0, 'W', 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 'W', 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, L(2), 0, 0, 0]
        ],
        thinWalls: {
            vertical: [[2, 1], [3, 1], [5, 4], [7, 3], [7, 4]],
            horizontal: [[2, 2], [5, 2]]
        }
    },
    {
        id: 'neg-2',
        target: 32,
        name: "Collison",
        description: "Merge positive and negetive tiles to cancel them out!",
        grid: [
            ['W', 0, -2, 'W', 'W'],
            [16, L(2), 0, L(8), L(16)],
            ['W', 'W', -8, 0, 'W']
        ],
        thinWalls: {
            vertical: [],
            horizontal: [[0, 2], [1, 2]]
        }
    },
    {
        id: 'neg-3',
        target: 8,
        name: "Antimatter",
        description: "Blue tiles are negative. Merge +2 and -2 to cancel them out!",
        grid: [
            [2, -2, 0, 0],
            [-4, 4, 0, 0],
            [2, 2, -4, 0],
            [0, 0, 0, 0]
        ]
    }
]);
export const INITIAL_LEVELS: Level[] = [
    ...BASICS,
    ...WALLS,
    ...CHALLENGES,
    ...EXPERT,
    ...MECHANICS,
    ...NEGETIVITY,
    ...MISCELLANEOUS
];