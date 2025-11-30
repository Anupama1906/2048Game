// types.ts
export interface StationaryCell {
    type: 'stationary';
    value: number;
}

export type Cell = number | 'WALL' | StationaryCell;
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
    grid: (number | 'W' | 'WALL' | 0 | StationaryCell)[][]; // Fixed: Now correctly a 2D array
    thinWalls?: {
        vertical: [number, number][];   // [row, col] -> Wall is to the RIGHT of this cell
        horizontal: [number, number][]; // [row, col] -> Wall is BELOW this cell
    };
}