// src/types/types.ts
export interface StationaryCell {
    type: 'stationary';
    value: number;
}

export interface GeneratorCell {
    type: 'generator';
    value: number;
}

// NEW: Sticky Cell Definition
export interface StickyCell {
    type: 'sticky';
    value: number;
}

export type Cell = number | 'WALL' | StationaryCell | GeneratorCell | StickyCell;

// ... (rest of the file remains the same)
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
    grid: (number | 'W' | 'WALL' | 0 | StationaryCell | GeneratorCell | StickyCell)[][];
    thinWalls?: {
        vertical: [number, number][];
        horizontal: [number, number][];
    };
}