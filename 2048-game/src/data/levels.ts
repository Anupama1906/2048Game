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
        par: 4,
        grid: [
            [0, 0, 0, 0, 0],
            [0, 'W', 'W', 'W', 0],
            [0, 'W', 2048, 'W', 0],
            [0, 'W', 'W', 'W', 0],
            [0, 2, 'W', 2, 0]
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
        id: 'wall-4',
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
    }
]);

const LOCKS = createSection("Locks", [
    {
        id: 'lock-1',
        target: 32,
        name: "Locked Up",
        description: "Locked cells cannot be moved or merged until they are unlocked.",
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
    }
]);

const STICKY = createSection("Sticky", [
    {
        id: 'stick-1',
        target: 32,
        name: "Sticky Situation",
        description: "Sticky tiles prevent further movement.",
        grid: [
            [2, S(0), L(8), 0],
            [L(16), 0, 0, S(0)],
            [L(4), 0, S(0), S(0)],
            [0, L(2), 0, 0]
        ]
    }
]);

const TEMPORARY = createSection("Temporary", [
    {
        id: 'temp-1',
        target: 16,
        name: "Crumbling Path",
        description: "The path behind you crumbles. Plan your route!",
        grid: [
            [8, T(1), T(1), T(1)],
            [T(1), T(1), 2, T(1)],
            [T(1), L(8), T(1), T(1)],
            [T(1), T(1), T(1), T(1)]
        ],
        thinWalls: {
            vertical: [],
            horizontal: [[0, 0]]
        }
    },
    {
        id: 'temp-2',
        target: 16,
        name: "2 Way Bridge",
        description: "You can only cross the bridge twice.",
        grid: [
            [L(8), 0, 'W', L(4)],
            [0, 0, T(2), 0],
            [4, 0, 'W', 'W']
        ]
    }
]);

const GENERATORS = createSection("Generators", [
    {
        id: 'gen-1',
        target: 32,
        name: "Factory",
        description: "Generators create numbers.",
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
        target: -4,
        name: "Negative Steps",
        description: "Merge negative tiles to reach the target.",
        grid: [
            [-2, 0],
            [0, -2]
        ]
    },
    {
        id: 'neg-2',
        target: 32,
        name: "Collision",
        description: "Merge positive and negative tiles to cancel them out!",
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
            [0, 0, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, L(2), 0, 0, 0]
        ],
        thinWalls: {
            vertical: [[2, 1], [3, 1], [5, 4], [7, 3], [7, 4]],
            horizontal: [[2, 2], [5, 2]]
        }
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