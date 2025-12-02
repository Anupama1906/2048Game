// src/types/types.ts
export interface LockedCell {
    type: 'locked';
    value: number;
}

export interface GeneratorCell {
    type: 'generator';
    value: number;
}

export interface StickyCell {
    type: 'sticky';
    value: number;
}

// NEW: Temporary Cell Definition
export interface TemporaryCell {
    type: 'temporary';
    value: number;
    limit: number; // Number of times it can be left
}

export type Cell = number | 'WALL' | LockedCell | GeneratorCell | StickyCell | TemporaryCell;

export type Grid = Cell[][];
export type GameState = 'playing' | 'won' | 'lost';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type AppScreen = 'menu' | 'level-select' | 'game' | 'creator';

export interface Level {
    id: number | string;
    target: number;
    name: string;
    description: string;
    section?: string;
    par?: number;
    grid: (number | 'W' | 'WALL' | 0 | LockedCell | GeneratorCell | StickyCell | TemporaryCell)[][];
    thinWalls?: {
        vertical: [number, number][];
        horizontal: [number, number][];
    };
}