import type { Grid, Level, Direction, Cell } from '../types/types';
import { WALL } from '../constants/game';
import * as GridOps from './grid';
import * as Mechanics from './mechanics';

export interface MoveResult {
    grid: Grid;
    moved: boolean;
    scoreDelta: number;
}

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

export const moveGrid = (grid: Grid, direction: Direction, level: Level): MoveResult => {
    let rotations = 0;
    if (direction === 'UP') rotations = 3;    
    if (direction === 'RIGHT') rotations = 2; 
    if (direction === 'DOWN') rotations = 1;  

    let workingGrid = GridOps.cloneGrid(grid);

    // Initial dimensions
    let currentRows = workingGrid.length;
    let currentCols = workingGrid[0].length;

    // Rotate Grid and track dimensions
    for (let i = 0; i < rotations; i++) {
        workingGrid = GridOps.rotateGrid(workingGrid);
        // Swap dimensions after rotation
        const temp = currentRows;
        currentRows = currentCols;
        currentCols = temp;
    }

    // 2. Prepare Thin Walls
    // Note: We start with original level dimensions
    let vWalls = GridOps.createWallMap(level.thinWalls?.vertical, grid.length, grid[0].length);
    let hWalls = GridOps.createWallMap(level.thinWalls?.horizontal, grid.length, grid[0].length);

    let wRows = grid.length;
    let wCols = grid[0].length;

    // Rotate Walls iteratively to match the grid
    for (let i = 0; i < rotations; i++) {
        const rotated = rotateWallsData(vWalls, hWalls, wRows, wCols);
        vWalls = rotated.v;
        hWalls = rotated.h;
        // Swap wall dimensions
        const temp = wRows;
        wRows = wCols;
        wCols = temp;
    }

    // 3. Process Logic (Always Slide Left)
    let moved = false;
    for (let r = 0; r < currentRows; r++) {
        const originalRow = workingGrid[r];
        const activeWalls = vWalls[r]; // Walls blocking horizontal movement in this row

        // A. Expand
        const expanded = expandRowWithWalls(originalRow, activeWalls);
        // B. Mechanics
        const processedExpanded = Mechanics.processRow(expanded);
        // C. Contract
        const finalRow = contractRow(processedExpanded, activeWalls, currentCols);

        if (!GridOps.areGridsEqual([originalRow], [finalRow])) {
            moved = true;
        }
        workingGrid[r] = finalRow;
    }

    // 4. Restore Orientation
    const restoreRotations = (4 - rotations) % 4;
    for (let i = 0; i < restoreRotations; i++) {
        workingGrid = GridOps.rotateGrid(workingGrid);
    }

    return {
        grid: workingGrid,
        moved,
        scoreDelta: 0
    };
};

export const canMove = (grid: Grid, level: Level): boolean => {
    const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    for (const dir of dirs) {
        const result = moveGrid(grid, dir, level);
        if (result.moved) return true;
    }
    return false;
};

// Updated Helper for wall rotation to handle MxN
const rotateWallsData = (v: boolean[][], h: boolean[][], rows: number, cols: number) => {
    // New dimensions will be cols x rows
    const newV = Array(cols).fill(null).map(() => Array(rows).fill(false));
    const newH = Array(cols).fill(null).map(() => Array(rows).fill(false));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // 1. Vertical Wall at (r,c) [Right of cell]
            // Becomes Horizontal Wall -> Below cell (c, rows-1-r)
            if (v[r][c]) {
                const newR = c;
                const newC = rows - 1 - r;
                if (newR < cols && newC < rows) {
                    newH[newR][newC] = true;
                }
            }

            // 2. Horizontal Wall at (r,c) [Below cell]
            // Becomes Vertical Wall -> Right of cell (c, rows-2-r)
            // Logic: Wall was between rows r and r+1.
            // Rotated: Between cols (rows-1-r) and (rows-2-r).
            if (h[r][c]) {
                const newR = c;
                const newC = rows - 2 - r;
                if (newR < cols && newC >= 0 && newC < rows) {
                    newV[newR][newC] = true;
                }
            }
        }
    }
    return { v: newV, h: newH };
};