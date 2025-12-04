// src/data/dailyLevels.ts
import type { Level, LockedCell, GeneratorCell, StickyCell } from "../types/types";

// Helper functions
const L = (val: number): LockedCell => ({ type: 'locked', value: val });
const G = (val: number): GeneratorCell => ({ type: 'generator', value: val });
const S = (val: number): StickyCell => ({ type: 'sticky', value: val });

export const DAILY_LEVELS: Level[] = [
    // Week 1 - Monday to Sunday (Beginner Friendly)
    {
        id: 'daily-1',
        target: 32,
        name: "Monday Morning",
        description: "Start your week with an easy warm-up.",
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
        name: "Tuesday Twist",
        description: "Navigate around the center walls.",
        par: 8,
        grid: [
            [4, 0, 0, 4],
            [0, 'W', 'W', 0],
            [0, 'W', 'W', 0],
            [8, 0, 0, 8]
        ]
    },
    {
        id: 'daily-3',
        target: 128,
        name: "Wednesday Wall",
        description: "Use the center pillar strategically.",
        par: 12,
        grid: [
            [2, 2, 4, 4],
            [2, 'W', 'W', 4],
            [8, 'W', 'W', 8],
            [8, 8, 16, 16]
        ]
    },
    {
        id: 'daily-4',
        target: 64,
        name: "Thursday Locks",
        description: "Unlock your way to victory.",
        par: 10,
        grid: [
            [L(32), 0, 0],
            [0, L(16), 0],
            [0, 0, L(16)]
        ]
    },
    {
        id: 'daily-5',
        target: 128,
        name: "Friday Flow",
        description: "End the work week with smooth merges.",
        par: 9,
        grid: [
            [2, 4, 8, 16],
            [2, 4, 8, 16],
            [32, 0, 0, 64],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 'daily-6',
        target: 256,
        name: "Saturday Challenge",
        description: "Weekend puzzle for the pros.",
        par: 15,
        grid: [
            [2, 0, 'W', 0, 2],
            [4, 'W', 128, 'W', 4],
            [8, 0, 'W', 0, 8],
            [16, 0, 0, 0, 16],
            [32, 0, 0, 0, 32]
        ]
    },
    {
        id: 'daily-7',
        target: 512,
        name: "Sunday Summit",
        description: "Reach new heights before the week resets.",
        par: 18,
        grid: [
            [L(256), 0, L(128)],
            [L(64), 2, L(32)],
            [L(16), 4, L(8)]
        ]
    },

    // Week 2 - More Intermediate Challenges
    {
        id: 'daily-8',
        target: 64,
        name: "Corridor Crawl",
        description: "Navigate the narrow passages.",
        par: 11,
        grid: [
            ['W', 2, 'W'],
            [0, 'W', 0],
            ['W', 4, 'W'],
            [0, 'W', 0],
            ['W', 8, 'W'],
            [0, 'W', 0],
            ['W', 16, 'W']
        ]
    },
    {
        id: 'daily-9',
        target: 128,
        name: "Cross Roads",
        description: "Choose your path wisely.",
        par: 13,
        grid: [
            [0, 0, 8, 0, 0],
            [0, 0, 'W', 0, 0],
            [16, 'W', 'W', 'W', 16],
            [0, 0, 'W', 0, 0],
            [0, 0, 32, 0, 0]
        ]
    },
    {
        id: 'daily-10',
        target: 256,
        name: "Locked Grid",
        description: "Unlock the pattern.",
        par: 14,
        grid: [
            [L(2), 0, L(4), 0],
            [0, L(8), 0, L(16)],
            [L(32), 0, L(64), 0],
            [0, L(128), 0, 2]
        ]
    },
    {
        id: 'daily-11',
        target: 32,
        name: "Sticky Starter",
        description: "Learn the sticky cell behavior.",
        par: 7,
        grid: [
            [2, S(0), 0, 0],
            [0, 0, S(0), 2],
            [4, S(0), 0, 0],
            [0, 0, S(0), 4]
        ]
    },
    {
        id: 'daily-12',
        target: 64,
        name: "Generator Intro",
        description: "Use the factory to create tiles.",
        par: 20,
        grid: [
            [G(2), 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 'daily-13',
        target: -8,
        name: "Negative Space",
        description: "Work with negative numbers.",
        par: 5,
        grid: [
            [-2, 0, -2],
            [0, 0, 0],
            [-4, 0, 0]
        ]
    },
    {
        id: 'daily-14',
        target: 32,
        name: "Cancelation",
        description: "Positive meets negative.",
        par: 9,
        grid: [
            [2, -2, 0, 0],
            [4, 0, -4, 0],
            [0, 8, 0, 16],
            [16, 0, 0, 0]
        ]
    },

    // Week 3 - Advanced Mechanics
    {
        id: 'daily-15',
        target: 128,
        name: "Thin Walls",
        description: "Walls between cells change the game.",
        par: 12,
        grid: [
            [2, 2, 0, 0],
            [4, 4, 0, 0],
            [8, 8, 0, 0],
            [16, 16, 0, 0]
        ],
        thinWalls: {
            vertical: [[0, 1], [1, 1], [2, 1], [3, 1]],
            horizontal: []
        }
    },
    {
        id: 'daily-16',
        target: 256,
        name: "Diamond Pattern",
        description: "Merge in a diamond formation.",
        par: 16,
        grid: [
            [0, 0, 2, 0, 0],
            [0, 4, 'W', 4, 0],
            [8, 'W', 'W', 'W', 8],
            [0, 16, 'W', 16, 0],
            [0, 0, 32, 0, 0]
        ]
    },
    {
        id: 'daily-17',
        target: 512,
        name: "Locked Pyramid",
        description: "Climb the pyramid of locks.",
        par: 20,
        grid: [
            [0, 0, L(256), 0, 0],
            [0, L(128), 2, L(128), 0],
            [L(64), 0, 4, 0, L(64)]
        ]
    },
    {
        id: 'daily-18',
        target: 64,
        name: "Sticky Maze",
        description: "Navigate through sticky obstacles.",
        par: 14,
        grid: [
            [2, S(0), 0, S(0), 2],
            [S(0), 0, S(0), 0, S(0)],
            [0, S(0), 4, S(0), 0],
            [S(0), 0, S(0), 0, S(0)],
            [2, S(0), 0, S(0), 2]
        ]
    },
    {
        id: 'daily-19',
        target: 128,
        name: "Double Generator",
        description: "Two factories working together.",
        par: 25,
        grid: [
            [G(2), 0, 0, G(4)],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 'daily-20',
        target: -256,
        name: "Negative Puzzle",
        description: "Balance positive and negative.",
        par: 10,
        grid: [
            [-32, -64, -16],
            [-2, 0, -8],
            [-4, -128, -2]
        ]
    },
    {
        id: 'daily-21',
        target: 128,
        name: "F-1-7",
        description: "Merge to win.",
        par: 25,
        grid: [
            [4, 4, 16, 16],
            [4, 8, 8, 16],
            [4, 4, 8, 16],
            [4, 8, 8, 8]
        ]
    },

    // Week 4 - Expert Level
    {
        id: 'daily-22',
        target: 2048,
        name: "Negetive Unblocker",
        description: "Use negetive numbers to unblock the path",
        par: 18,
        grid: [
            [1024, 0, L(8), 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, L(8)],
            [0, 0, 0, 0, 0],
            [G(-2), 0, 0, 0, L(1024)]
        ],
        thinWalls: {
            vertical: [[1, 3], [3, 3], [4, 3]],
            horizontal: [[0, 0], [0, 1], [0, 3]]
        }
    },
    {
        id: 'daily-23',
        target: 512,
        name: "Checkboard",
        description: "Alternate your way through.",
        par: 22,
        grid: [
            [L(2), 0, L(4), 0, L(8)],
            [0, L(16), 0, L(32), 0],
            [L(64), 0, L(128), 0, L(256)],
            [0, 2, 0, 4, 0]
        ]
    },
    {
        id: 'daily-24',
        target: 128,
        name: "Sticky Symphony",
        description: "Master the sticky timing.",
        par: 16,
        grid: [
            [2, S(0), S(0), S(0), 2],
            [4, S(0), 0, S(0), 4],
            [8, S(0), 0, S(0), 8],
            [16, S(0), S(0), S(0), 16]
        ]
    },
    {
        id: 'daily-25',
        target: 256,
        name: "Generator Matrix",
        description: "Control the chaos.",
        par: 30,
        grid: [
            [G(2), 0, 0, 0, G(2)],
            [0, 'W', 'W', 'W', 0],
            [0, 'W', 0, 'W', 0],
            [0, 'W', 'W', 'W', 0],
            [G(4), 0, 0, 0, G(4)]
        ]
    },
    {
        id: 'daily-26',
        target: 64,
        name: "Negative Harmony",
        description: "Find balance in opposition.",
        par: 12,
        grid: [
            [32, -16, 0, 16, -32],
            [0, 8, -8, 0, 0],
            [64, 0, 0, 0, -64]
        ]
    },
    {
        id: 'daily-27',
        target: 2048,
        name: "The Master",
        description: "Only for the worthy.",
        par: 35,
        grid: [
            [L(1024), 'W', L(512), 'W', L(256)],
            ['W', S(0), 'W', S(0), 'W'],
            [L(128), 'W', 2, 'W', L(64)],
            ['W', S(0), 'W', S(0), 'W'],
            [L(32), 'W', L(16), 'W', L(8)]
        ]
    },
    {
        id: 'daily-28',
        target: 512,
        name: "Thin Line",
        description: "Precision required.",
        par: 20,
        grid: [
            [2, 2, 4, 4],
            [8, 8, 16, 16],
            [32, 32, 64, 64],
            [128, 128, 256, 256]
        ],
        thinWalls: {
            vertical: [[0, 1], [1, 1], [2, 1], [3, 1]],
            horizontal: [[1, 0], [1, 1], [1, 2], [1, 3]]
        }
    },
    {
        id: 'daily-29',
        target: 1024,
        name: "Ultimate Lock",
        description: "Break free from all constraints.",
        par: 28,
        grid: [
            [L(512), L(256), L(128)],
            [L(64), L(32), L(16)],
            [L(8), L(4), L(2)]
        ]
    },
    {
        id: 'daily-30',
        target: 256,
        name: "Grand Finale",
        description: "Everything you've learned comes together.",
        par: 30,
        grid: [
            [G(2), S(0), -4, L(16), 'W'],
            ['W', L(32), 0, S(0), 2],
            [-8, 0, L(64), 'W', 4],
            [S(0), 'W', 0, L(128), 8],
            [16, 2, S(0), -16, G(4)]
        ]
    }
];