import type { Grid, Level, Direction, Cell } from '../types/types';
import { WALL } from '../constants/constants';
import * as GridOps from './grid';
import * as Mechanics from './mechanics';

export interface MoveResult {
    grid: Grid;
    moved: boolean;
    scoreDelta: number;
}

/**
 * Expands a row to include thin walls as pseudo-cells (WALL)
 */
const expandRowWithWalls = (row: Cell[], wallMapRow: boolean[]): Cell[] => {
    const expanded: Cell[] = [];
    for (let i = 0; i < row.length; i++) {
        expanded.push(row[i]);
        if (i < row.length - 1 && wallMapRow[i]) {
            expanded.push(WALL);
        }
    }
    return expanded;
};

/**
 * Contracts the row back to normal size
 */
const contractRow = (processedRow: Cell[], wallMapRow: boolean[], originalLength: number): Cell[] => {
    const finalRow: Cell[] = [];
    let sourceIndex = 0;

    for (let i = 0; i < originalLength; i++) {
        finalRow.push(processedRow[sourceIndex]);
        sourceIndex++;
        if (i < originalLength - 1 && wallMapRow[i]) {
            sourceIndex++;
        }
    }
    return finalRow;
};

/**
 * Main Move Function
 */
export const moveGrid = (grid: Grid, direction: Direction, level: Level): MoveResult => {
    const size = grid.length;
    let workingGrid = GridOps.cloneGrid(grid);

    // 1. Orient the board so we are always moving LEFT
    let rotations = 0;
    if (direction === 'UP') rotations = 3;    // 270deg CW
    if (direction === 'RIGHT') rotations = 2; // 180deg CW
    if (direction === 'DOWN') rotations = 1;  // 90deg CW

    // Rotate Grid
    for (let i = 0; i < rotations; i++) workingGrid = GridOps.rotateGrid(workingGrid);

    // 2. Prepare Thin Walls for this orientation
    let vWalls = GridOps.createWallMap(level.thinWalls?.vertical, size);
    let hWalls = GridOps.createWallMap(level.thinWalls?.horizontal, size);

    // Rotate Walls iteratively to match the grid
    for (let i = 0; i < rotations; i++) {
        const rotated = rotateWallsData(vWalls, hWalls, size);
        vWalls = rotated.v;
        hWalls = rotated.h;
    }

    // 3. Process Logic (Always Slide Left)
    let moved = false;
    for (let r = 0; r < size; r++) {
        const originalRow = workingGrid[r];
        const activeWalls = vWalls[r]; // Walls blocking horizontal movement in this row

        // A. Expand
        const expanded = expandRowWithWalls(originalRow, activeWalls);
        // B. Mechanics
        const processedExpanded = Mechanics.processRow(expanded);
        // C. Contract
        const finalRow = contractRow(processedExpanded, activeWalls, size);

        if (!GridOps.areGridsEqual([originalRow], [finalRow])) {
            moved = true;
        }
        workingGrid[r] = finalRow;
    }

    // 4. Restore Orientation
    const restoreRotations = (4 - rotations) % 4;
    for (let i = 0; i < restoreRotations; i++) workingGrid = GridOps.rotateGrid(workingGrid);

    return {
        grid: workingGrid,
        moved,
        scoreDelta: 0
    };
};

/**
 * Check if any move is possible
 */
export const canMove = (grid: Grid, level: Level): boolean => {
    const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    for (const dir of dirs) {
        const result = moveGrid(grid, dir, level);
        if (result.moved) return true;
    }
    return false;
};

// Helper for wall rotation (90 degrees Clockwise)
const rotateWallsData = (v: boolean[][], h: boolean[][], size: number) => {
    const newV = Array(size).fill(null).map(() => Array(size).fill(false));
    const newH = Array(size).fill(null).map(() => Array(size).fill(false));

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            // 1. Vertical Wall at (r,c) -> Right of cell (r,c)
            // Becomes Horizontal Wall -> Below cell (c, size-1-r)
            if (v[r][c]) {
                const newR = c;
                const newC = size - 1 - r;
                if (newR < size && newC < size) {
                    newH[newR][newC] = true;
                }
            }

            // 2. Horizontal Wall at (r,c) -> Below cell (r,c)
            // Becomes Vertical Wall -> Right of cell (c, size-2-r)
            // Logic: Wall was between rows r and r+1.
            // Rotated: Between cols (size-1-r) and (size-2-r).
            // This corresponds to "Right of cell (c, size-2-r)".
            if (h[r][c]) {
                const newR = c;
                const newC = size - 2 - r;
                if (newR < size && newC >= 0 && newC < size) {
                    newV[newR][newC] = true;
                }
            }
        }
    }
    return { v: newV, h: newH };
};