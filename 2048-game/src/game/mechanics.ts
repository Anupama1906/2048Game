import type { Cell } from '../types/types';
import { WALL } from '../constants/constants';

/**
 * MECHANICS CONFIGURATION
 * Edit these functions to change how the game behaves.
 */

// Rule: Can tile A merge into tile B?
export const canMerge = (a: Cell, b: Cell): boolean => {
    if (a === WALL || b === WALL) return false;
    if (a === 0 || b === 0) return false;
    return a === b;
};

// Rule: What happens when they merge?
export const getMergeResult = (val: number): number => {
    return val * 2;
};

// Rule: Is this cell an immovable obstacle?
export const isObstacle = (cell: Cell): boolean => {
    return cell === WALL;
};

/**
 * Process a single row (slide & merge).
 * This is the core 2048 algorithm, isolated from the grid structure.
 */
export const processRow = (line: Cell[]): Cell[] => {
    // 1. Break line into segments separated by hard WALLs
    let segments: Cell[][] = [];
    let currentSegment: Cell[] = [];

    for (let cell of line) {
        if (isObstacle(cell)) {
            if (currentSegment.length > 0) segments.push(currentSegment);
            segments.push([WALL]); // Keep the wall as its own segment
            currentSegment = [];
        } else {
            currentSegment.push(cell);
        }
    }
    if (currentSegment.length > 0) segments.push(currentSegment);

    // 2. Process each segment (Slide & Merge)
    let processedLine: Cell[] = [];

    segments.forEach(seg => {
        if (seg[0] === WALL) {
            processedLine.push(WALL);
            return;
        }

        // Filter out zeros (slide to left)
        let tiles = seg.filter(val => val !== 0) as number[];
        let mergedTiles: number[] = [];

        for (let i = 0; i < tiles.length; i++) {
            // Check merge
            if (i < tiles.length - 1 && canMerge(tiles[i], tiles[i + 1])) {
                mergedTiles.push(getMergeResult(tiles[i]));
                i++; // Skip next tile as it was merged
            } else {
                mergedTiles.push(tiles[i]);
            }
        }

        // Pad with zeros to maintain length
        while (mergedTiles.length < seg.length) mergedTiles.push(0);

        processedLine = processedLine.concat(mergedTiles);
    });

    return processedLine;
};