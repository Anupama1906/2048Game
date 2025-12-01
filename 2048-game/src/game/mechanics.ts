// src/game/mechanics.ts
import type { Cell, StationaryCell, GeneratorCell, StickyCell } from '../types/types';
import { WALL } from '../constants/game';

// --- HELPERS ---

export const isStationary = (cell: Cell): cell is StationaryCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'stationary';
};

export const isGenerator = (cell: Cell): cell is GeneratorCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'generator';
};

// NEW: Helper for Sticky
export const isSticky = (cell: Cell): cell is StickyCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'sticky';
};

export const getCellValue = (cell: Cell): number => {
    if (typeof cell === 'number') return cell;
    if (isStationary(cell)) return cell.value;
    if (isGenerator(cell)) return cell.value;
    if (isSticky(cell)) return cell.value; // Sticky cells have values
    return 0;
};

// Helper: Create an empty version of a cell (preserving type if it's Sticky)
const makeEmpty = (cell: Cell): Cell => {
    if (isSticky(cell)) return { type: 'sticky', value: 0 };
    return 0;
};

// Helper: Put a value INTO a cell (preserving type if Sticky)
const updateCellValue = (cell: Cell, newVal: number): Cell => {
    if (isSticky(cell)) return { type: 'sticky', value: newVal };
    return newVal;
};

export const canMerge = (a: Cell, b: Cell): boolean => {
    if (a === WALL || b === WALL) return false;
    if (isGenerator(a) || isGenerator(b)) return false;

    const valA = getCellValue(a);
    const valB = getCellValue(b);
    if (valA === 0 || valB === 0) return false;

    // Standard 2048 merge rules
    return valA === valB || valA === -valB;
};

export const getMergeResult = (valA: number, valB: number): number => {
    if (valA === -valB) return 0;
    return valA * 2;
};

export const isHardObstacle = (cell: Cell): boolean => {
    return cell === WALL || isGenerator(cell);
};

interface ProcessResult {
    grid: Cell[];
    merged: boolean[];
}

/**
 * UPDATED: Slide and Merge Logic that supports Sticky Cells.
 * Instead of "filter zeros -> process -> pad", we iterate and move tiles
 * to respect the physical location of Sticky Cells (P).
 */
const slideAndMergeWithSticky = (chunk: Cell[]): ProcessResult => {
    const result = [...chunk]; // Work on a copy
    const mergedFlags = new Array(chunk.length).fill(false);

    // Iterate Left-to-Right (skipping index 0 as it can't move left)
    for (let i = 1; i < result.length; i++) {
        // We only move things that have a value
        if (getCellValue(result[i]) === 0) continue;

        let currentIdx = i;

        // Bubble the tile to the left as far as it can go
        while (currentIdx > 0) {
            const leftIdx = currentIdx - 1;
            const currentCell = result[currentIdx];
            const leftCell = result[leftIdx];
            const currentVal = getCellValue(currentCell);
            const leftVal = getCellValue(leftCell);

            // 1. Left is EMPTY (0) or EMPTY STICKY P(0)
            if (leftVal === 0) {
                if (isSticky(leftCell)) {
                    // HIT EMPTY STICKY: Move INTO it and STOP immediately.
                    result[leftIdx] = updateCellValue(leftCell, currentVal);
                    result[currentIdx] = makeEmpty(currentCell);
                    break; // Stop! It stuck.
                } else {
                    // STANDARD EMPTY SPACE: Move into it and continue loop
                    result[leftIdx] = updateCellValue(leftCell, currentVal);
                    result[currentIdx] = makeEmpty(currentCell);
                    currentIdx--; // Keep looking left
                    continue;
                }
            }

            // 2. Left has VALUE (Merge Candidate)
            if (canMerge(currentCell, leftCell) && !mergedFlags[leftIdx] && !mergedFlags[currentIdx]) {
                const incomingStationary = isStationary(currentCell);

                // Prevent stationary from moving (it can only receive, not initiate)
                // But wait, stationary is handled by chunk splitting usually. 
                // If we are here, 'current' is likely a normal or sticky tile.
                if (!incomingStationary) {
                    const newVal = getMergeResult(currentVal, leftVal);

                    // Update Left Cell with new value
                    result[leftIdx] = updateCellValue(leftCell, newVal);
                    // Clear Current Cell
                    result[currentIdx] = makeEmpty(currentCell);

                    mergedFlags[leftIdx] = true; // Mark as merged
                    break; // Stop after merge
                }
            }

            // 3. Blocked by non-mergeable value
            break;
        }
    }

    return { grid: result, merged: mergedFlags };
};

/**
 * Process a chunk that may contain stationary tiles.
 * Note: Sticky Cells are NOT chunk separators (unlike Stationary/Walls).
 * They are handled INSIDE slideAndMergeWithSticky.
 */
const processChunkWithStationary = (chunk: Cell[]): ProcessResult => {
    // 1. Find Stationary Cells (Hard anchors)
    const firstStatIdx = chunk.findIndex(c => isStationary(c));

    if (firstStatIdx === -1) {
        // No stationary cells? Run the Sticky-aware slider
        return slideAndMergeWithSticky(chunk);
    }

    // 2. Handle Stationary Split
    const stationaryCell = chunk[firstStatIdx] as StationaryCell;
    const leftPart = chunk.slice(0, firstStatIdx);
    const rightPart = chunk.slice(firstStatIdx + 1);

    // Process Left Side
    const leftRes = slideAndMergeWithSticky(leftPart);

    // Process Right Side
    const rightRes = processChunkWithStationary(rightPart); // Recursive for multiple stationary cells

    // 3. Attempt to merge from Right Result into the Stationary Cell
    const incomingTileIdx = rightRes.grid.findIndex(c => getCellValue(c) !== 0);
    const incomingTile = incomingTileIdx !== -1 ? rightRes.grid[incomingTileIdx] : 0;
    const isIncomingMerged = incomingTileIdx !== -1 ? rightRes.merged[incomingTileIdx] : false;

    // Check Merge Conditions
    if (incomingTile !== 0 &&
        !isStationary(incomingTile) &&
        !isIncomingMerged &&
        canMerge(incomingTile, stationaryCell)) {

        const valIn = getCellValue(incomingTile);
        const valStat = getCellValue(stationaryCell);
        const mergedValue = getMergeResult(valIn, valStat);

        // Remove incoming from right grid
        const rightGridMod = [...rightRes.grid];
        rightGridMod[incomingTileIdx] = makeEmpty(incomingTile);

        // Compact the hole on the right
        const compactedRight = slideAndMergeWithSticky(rightGridMod); // Use sticky logic for compacting

        return {
            grid: [...leftRes.grid, mergedValue, ...compactedRight.grid],
            merged: [...leftRes.merged, true, ...compactedRight.merged]
        };
    } else {
        return {
            grid: [...leftRes.grid, stationaryCell, ...rightRes.grid],
            merged: [...leftRes.merged, false, ...rightRes.merged]
        };
    }
};

/**
 * Process a single row (slide & merge).
 */
export const processRow = (line: Cell[]): Cell[] => {
    let result: Cell[] = [];
    let buffer: Cell[] = [];

    for (let i = 0; i < line.length; i++) {
        const cell = line[i];

        if (isHardObstacle(cell)) {
            // Process buffer
            let processingInput = [...buffer];
            // Generators feed into the buffer but act as walls
            if (isGenerator(cell)) {
                processingInput.push(cell.value);
            }

            let processedRes = processChunkWithStationary(processingInput);

            // If generator, pop the last element (it was the generator seed)
            let processed = processedRes.grid;
            if (isGenerator(cell)) {
                processed.pop();
            }

            // Fill buffer space (Sticky logic preserves length, but just in case)
            const fitted = processed.slice(0, buffer.length);
            while (fitted.length < buffer.length) fitted.push(0);

            result.push(...fitted);
            result.push(cell);
            buffer = [];
        } else {
            buffer.push(cell);
        }
    }

    if (buffer.length > 0) {
        let processedRes = processChunkWithStationary(buffer);
        let processed = processedRes.grid;
        while (processed.length < buffer.length) processed.push(0);
        result.push(...processed);
    }

    return result;
};