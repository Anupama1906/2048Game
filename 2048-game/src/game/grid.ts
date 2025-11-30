import type { Grid } from '../types/types';

// Updated to accept distinct rows/cols, though usually inferred from context
export const createEmptyGrid = (rows: number, cols: number): Grid =>
    Array(rows).fill(null).map(() => Array(cols).fill(0));

export const cloneGrid = (grid: Grid): Grid =>
    grid.map(row => [...row]);

export const areGridsEqual = (g1: Grid, g2: Grid): boolean =>
    JSON.stringify(g1) === JSON.stringify(g2);

// Rotate grid 90 degrees clockwise
// Supports Rectangular: MxN becomes NxM
export const rotateGrid = (grid: Grid): Grid => {
    const rows = grid.length;
    const cols = grid[0].length;
    const newGrid = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // (r, c) -> (c, rows - 1 - r)
            newGrid[c][rows - 1 - r] = grid[r][c];
        }
    }
    return newGrid;
};

// Rotate counter-clockwise (for restoring orientation)
// Supports Rectangular: MxN becomes NxM
export const rotateGridCounter = (grid: Grid): Grid => {
    const rows = grid.length;
    const cols = grid[0].length;
    const newGrid = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // (r, c) -> (cols - 1 - c, r)
            newGrid[cols - 1 - c][r] = grid[r][c];
        }
    }
    return newGrid;
};

// Map walls to a 2D boolean grid (requires specific rows/cols now)
export const createWallMap = (walls: [number, number][] | undefined, rows: number, cols: number): boolean[][] => {
    const map = Array(rows).fill(null).map(() => Array(cols).fill(false));
    walls?.forEach(([r, c]) => { if (r < rows && c < cols) map[r][c] = true; });
    return map;
};