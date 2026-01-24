import type { Grid } from '../types/types';

export const createEmptyGrid = (rows: number, cols: number): Grid =>
    Array(rows).fill(null).map(() => Array(cols).fill(0));

export const cloneGrid = (grid: Grid): Grid =>
    grid.map(row => [...row]);


export const areGridsEqual = (g1: Grid, g2: Grid): boolean => {
    if (g1.length !== g2.length) return false;

    for (let r = 0; r < g1.length; r++) {
        if (g1[r].length !== g2[r].length) return false;

        for (let c = 0; c < g1[r].length; c++) {
            // For complex cells (objects), we still need deep comparison
            const cell1 = g1[r][c];
            const cell2 = g2[r][c];

            // Quick primitive check
            if (cell1 === cell2) continue;

            // Deep check for objects
            if (typeof cell1 === 'object' && typeof cell2 === 'object') {
                if (JSON.stringify(cell1) !== JSON.stringify(cell2)) return false;
            } else {
                return false;
            }
        }
    }
    return true;
};

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
export const createWallMap = (
    walls: [number, number][] | undefined,
    rows: number,
    cols: number
): boolean[][] => {
    const safeRows = Math.max(0, rows | 0);
    const safeCols = Math.max(0, cols | 0);

    const map = Array.from({ length: safeRows }, () =>
        Array.from({ length: safeCols }, () => false)
    );

    if (!walls || safeRows === 0 || safeCols === 0) {
        return map;
    }

    for (const [rawR, rawC] of walls) {
        const r = rawR | 0;
        const c = rawC | 0;

        if (r >= 0 && r < safeRows && c >= 0 && c < safeCols) {
            map[r][c] = true;
        }
    }

    return map;
};