// src/data/levels.ts
import type { Level, LockedCell, GeneratorCell, StickyCell, TemporaryCell } from "../types/types";

// --- HELPERS ---
const L = (val: number): LockedCell => ({ type: 'locked', value: val });
const G = (val: number): GeneratorCell => ({ type: 'generator', value: val });
const S = (val: number): StickyCell => ({ type: 'sticky', value: val });
const T = (limit: number, val: number = 0): TemporaryCell => ({ type: 'temporary', limit, value: val });

const createSection = (sectionName: string, levels: Omit<Level, 'section'>[]): Level[] => {
    return levels.map(level => ({
        ...level,
        section: sectionName
    }));
};

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
        target: 256,
        name: "Combinations",
        description: "Merge to reach higher numbers.",
        par: 5,
        grid: [
            [8, 8, 16, 32],
            [8, 8, 16, 32],
            [32, 16, 8, 8],
            [32, 16, 8, 8]
        ]
    },
    {
        id: 'basics-4',
        target: 64,
        name: "Efficient Merging",
        description: "Complete the level with fewest possible moves to receive a star.",
        par: 10,
        grid: [
            [4, 2, 2, 4],
            [2, 8, 8, 2],
            [2, 8, 8, 2],
            [4, 2, 2, 4]
        ]
    }
]);

const WALLS = createSection("Walls", [
    {
        id: 'wall-1',
        target: 4,
        name: "Turn Around",
        description: "Walls block movement.",
        par: 9,
        grid: [
            ['W', 0, 0, 0, 'W'],
            [0, 0, 'W', 0, 0],
            [0, 'W', 128, 'W', 0],
            [0, 0, 'W', 0, 0],
            ['W', 2, 'W', 2, 'W']
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
        target: 64,
        name: "Gates",
        description: "Use corners to your advantage",
        par: 7,
        grid: [
            ['W', 'W', 'W', 32, 'W'],
            [8, 16, 0, 0, 8],
            ['W', 0, 'W', 'W', 'W']
        ]
    },
    {
        id: 'wall-4',
        target: 16,
        name: "Cornered",
        description: "Plan Carefully. Use undo if you get stuck.",
        par: 5,
        grid: [
            [2, 2, 0, 2],
            [8, 2, 'W', 'W'],
            [0, 'W', 'W', 'W'],
            [0, 'W', 'W', 'W']
        ]
    },
    {
        id: 'wall-5',
        target: 4,
        name: "4 Rooms",
        description: "Thin walls block movement between cells.",
        par: 8,
        grid: [
            [2, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 0, 0, 0]
        ],
        thinWalls: {
            vertical: [[0, 1], [3, 1]],
            horizontal: [[1, 0], [1, 1], [1, 3]]
        }
    },
    {
        id: 'wall-6',
        target: 32,
        name: "Packing",
        description: "Thin walls block movement between cells.",
        par: 12,
        grid: [
            [2, 8, 16],
            [4, 0, 0],
            [2, 0, 0]
        ],
        thinWalls: {
            vertical: [[1, 1], [2, 0]],
            horizontal: [[0, 0]]
        }
    }

]);

const LOCKS = createSection("Locks", [
    {
        id: 'lock-1',
        target: 32,
        name: "Locked Chain",
        description: "Locked cells cannot be moved or merged until they are unlocked.",
        par: 6,
        grid: [
            [2, 'W', 0, 'W'],
            [0, 0, L(8), 0],
            [L(2), L(4), 0, L(16)],
            ['W', 0, 'W', 0]
        ]
    },

    {
        id: 'lock-2',
        target: 32,
        name: "Locked Up",
        description: "Use locked cells to your advantage.",
        par: 9,
        grid: [
            [0, 0, 0, 4],
            [0, 0, L(4), 0],
            [0, L(8), 0, 0],
            [16, 0, 0, 0]
        ]
    },

    {
        id: 'lock-2',
        target: 2048,
        name: "Unlocker",
        description: "Merging locked tiles stops movement. Use it to your advantage.",
        par: 13,
        grid: [
            [L(512), 0, L(128), 0],
            [L(16), 2, L(8), L(256)],
            [0, L(2), L(4), 0],
            [L(32), 0, L(64), L(1024)]
        ]
    },
    {
        id: 'lock-3',
        target: 16,
        name: "Lockpick",
        description: "Locked cells can trap tiles. Use merging to free them.",
        par: 5,
        grid: [
            ['W', 'W', 'W', 4, 'W'],
            [2, L(0), 0, L(0), L(8)],
            ['W', 2, 'W', 'W', 'W']
        ]
    }
]);

const STICKY = createSection("Sticky", [
    {
        id: 'stick-1',
        target: 4,
        name: "Sticky Situation",
        description: "Sticky tiles prevent further movement.",
        par: 3,
        grid: [
            ['W', 'W', 'W', 'W'],
            [2, S(0), S(0), L(2)],
            ['W', 'W', 'W', 'W']
        ]
    },
    {
        id: 'stick-2',
        target: 32,
        name: "Free Roam",
        description: "Plan your moves around sticky tiles and regular tiles.",
        par: 17,
        grid: [
            [2, S(0), S(0), S(0), L(16)],
            [S(0), 0, S(0), 0, S(0)],
            [S(0), S(0), L(4), S(0), S(0)],
            [S(0), 0, S(0), 0, S(0)],
            [L(8), S(0), S(0), S(0), L(2)]
        ]
    }
]);

const TEMPORARY = createSection("Temporary", [
    {
        id: 'temp-1',
        target: 4,
        name: "One-way path",
        description: "Temporary tile become walls after",
        par: 7,
        grid: [
            ['W', 0, T(1), 0],
            [2, T(1), 'W', T(1)],
            ['W', 'W', T(1), 0],
            [L(2), T(1), 0, 'W']
        ]
    },
    {
        id: 'temp-2',
        target: 4,
        name: "Walls of Time",
        description: "Use temporary walls to your advantage",
        par: 5,
        grid: [
            ['W', 'W', 0, 'W'],
            [L(2), 0, 0, 'W'],
            ['W', 'W', T(1), 'W'],
            [2, T(1), 0, 0]
        ]
    },
    {
        id: 'temp-3',
        target: 32,
        name: "Rooms of Time",
        description: "Number on temporary tiles denote how many times you can enter.",
        par:14,
        grid: [
            ['W', 'W', 0, T(2), 0],
            [L(16), 0, 0, 'W', L(4)],
            ['W', 'W', T(3), 'W', 'W'],
            [2, 0, 0, T(2), 0],
            ['W', 'W', L(8), 'W', L(2)]
        ]
    },
    {
        id: 'temp-4',
        target: 16,
        name: "Crumbling Path",
        description: "The path behind you crumbles. Plan your route!",
        par:5,
        grid: [
            [8, T(1), T(1), T(1)],
            [T(1), T(1), 2, T(1)],
            [T(1), L(8), T(1), T(1)],
            [T(1), T(1), T(1), T(1)]
        ],
        thinWalls: {
            vertical: [],
            horizontal: [[0, 0], [0, 1]]
        }
    }

]);

const GENERATORS = createSection("Generators", [
    {
        id: 'gen-1',
        target: 16,
        name: "Assembly Line",
        description: "Generators create numbers.",
        par: 10,
        grid: [
            ['W', 'W', 'W', 'W'],
            [G(2), 0, 0, 0],
            ['W', 'W', 'W', 'W']
        ]
    },
    {
        id: 'gen-2',
        target: 32,
        name: "Factory",
        description: "Generators produce tiles in every direction.",
        par: 19,
        grid: [
            [G(2), 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
    }
]);


const NEGATIVITY = createSection("Negativity", [
    {
        id: 'neg-1',
        target: -16,
        name: "Negative Steps",
        description: "Merge negative tiles to reach the target.",
        par: 3,
        grid: [
            [-2, 0, -2],
            [0, 0, 0],
            [-4, 0, -8]
        ]
    },
    {
        id: 'neg-2',
        target: 64,
        name: "Collision",
        description: "Merge positive and negative tiles to cancel them out!",
        par:3,
        grid: [
            ['W', -8, 'W', 'W', 'W'],
            [32, L(8), 0, L(-16), L(32)],
            ['W', 'W', 'W', 16, 'W']
        ]

    }
]);

const MISCELLANEOUS = createSection("Miscellaneous", [
    {
        id: 'misc-1',
        target: 32,
        name: "Crossroads",
        description: "Watch your step ;)",
        par: 13,
        grid: [
            [L(16), T(1), S(0), T(1), L(4)],
            [T(1), T(1), S(0), T(1), T(1)],
            [S(2), S(0), T(3), S(0), S(0)],
            [T(1), T(1), S(0), T(1), T(1)],
            [L(8), T(1), S(0), T(1), L(2)]
        ]
    }
]);

export const INITIAL_LEVELS: Level[] = [
    ...BASICS,
    ...WALLS,
    ...LOCKS,
    ...STICKY,
    ...TEMPORARY,
    ...GENERATORS,
    ...NEGATIVITY,
    ...MISCELLANEOUS
];