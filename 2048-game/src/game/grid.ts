import type { Grid } from '../types/types';

export const createEmptyGrid = (size: number): Grid =>
    Array(size).fill(null).map(() => Array(size).fill(0));

export const cloneGrid = (grid: Grid): Grid =>
    grid.map(row => [...row]);

export const areGridsEqual = (g1: Grid, g2: Grid): boolean =>
    JSON.stringify(g1) === JSON.stringify(g2);

// Rotate grid 90 degrees clockwise
// We use rotations so we only have to write the "Left" movement logic,
// and we can simulate Up/Right/Down by rotating the board.
export const rotateGrid = (grid: Grid): Grid => {
    const size = grid.length;
    const newGrid = createEmptyGrid(size);
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            newGrid[c][size - 1 - r] = grid[r][c];
        }
    }
    return newGrid;
};

// Rotate counter-clockwise (for undoing rotations)
export const rotateGridCounter = (grid: Grid): Grid => {
    const size = grid.length;
    const newGrid = createEmptyGrid(size);
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            newGrid[size - 1 - c][r] = grid[r][c];
        }
    }
    return newGrid;
};

// Helper to map wall definitions (e.g., [0,1]) to a 2D boolean grid
export const createWallMap = (walls: [number, number][] | undefined, size: number): boolean[][] => {
    const map = Array(size).fill(null).map(() => Array(size).fill(false));
    walls?.forEach(([r, c]) => { if (r < size && c < size) map[r][c] = true; });
    return map;
};

export const rotateWallMap = (walls: boolean[][]): boolean[][] => {
    const size = walls.length;
    const newMap = Array(size).fill(null).map(() => Array(size).fill(false));
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (walls[r][c]) {
                // Map the wall position to its new location after 90deg rotation
                // Note: Wall coordinates logic might need adjustment based on visual representation,
                // but strictly for the boolean map, this rotation is standard.
                newMap[c][size - 1 - r] = true;
            }
        }
    }
    return newMap;
};