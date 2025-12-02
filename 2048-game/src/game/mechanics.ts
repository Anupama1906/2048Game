// src/game/mechanics.ts
import type { Cell, LockedCell, GeneratorCell, StickyCell, TemporaryCell } from '../types/types';
import { WALL } from '../constants/game';

// --- HELPERS ---

export const isLocked = (cell: Cell): cell is LockedCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'locked';
};

export const isGenerator = (cell: Cell): cell is GeneratorCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'generator';
};

export const isSticky = (cell: Cell): cell is StickyCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'sticky';
};

export const isTemporary = (cell: Cell): cell is TemporaryCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'temporary';
};

export const getCellValue = (cell: Cell): number => {
    if (typeof cell === 'number') return cell;
    if (cell === WALL) return 0;
    if (isLocked(cell)) return cell.value;
    if (isGenerator(cell)) return cell.value;
    if (isSticky(cell)) return cell.value;
    if (isTemporary(cell)) return cell.value;
    return 0;
};

// Called when a tile leaves a cell
const makeEmpty = (cell: Cell): Cell => {
    if (isSticky(cell)) return { type: 'sticky', value: 0 };

    if (isTemporary(cell)) {
        // Decrement limit when leaving
        const newLimit = cell.limit - 1;
        if (newLimit <= 0) {
            return WALL; // Turns into a wall immediately
        }
        return { ...cell, value: 0, limit: newLimit };
    }

    return 0;
};

// Called when a tile enters a cell (or merges into it)
const updateCellValue = (cell: Cell, newVal: number): Cell => {
    if (isSticky(cell)) return { type: 'sticky', value: newVal };
    if (isTemporary(cell)) return { ...cell, value: newVal }; // Preserve limit, just update value
    return newVal;
};

export const canMerge = (a: Cell, b: Cell): boolean => {
    if (a === WALL || b === WALL) return false;
    if (isGenerator(a) || isGenerator(b)) return false;

    const valA = getCellValue(a);
    const valB = getCellValue(b);
    if (valA === 0 || valB === 0) return false;

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

const slideAndMergeWithSticky = (chunk: Cell[]): ProcessResult => {
    const result = [...chunk];
    const mergedFlags = new Array(chunk.length).fill(false);

    for (let i = 1; i < result.length; i++) {
        if (getCellValue(result[i]) === 0) continue;

        let currentIdx = i;

        while (currentIdx > 0) {
            const leftIdx = currentIdx - 1;
            const currentCell = result[currentIdx];
            const leftCell = result[leftIdx];
            const currentVal = getCellValue(currentCell);
            const leftVal = getCellValue(leftCell);

            // 1. Move into Empty
            if (leftVal === 0 && leftCell !== WALL) {
                if (isSticky(leftCell)) {
                    result[leftIdx] = updateCellValue(leftCell, currentVal);
                    result[currentIdx] = makeEmpty(currentCell);
                    break;
                } else {
                    result[leftIdx] = updateCellValue(leftCell, currentVal);
                    result[currentIdx] = makeEmpty(currentCell);
                    currentIdx--;
                    continue;
                }
            }

            // 2. Merge
            if (canMerge(currentCell, leftCell) && !mergedFlags[leftIdx] && !mergedFlags[currentIdx]) {
                const incomingLocked = isLocked(currentCell);

                if (!incomingLocked) {
                    const newVal = getMergeResult(currentVal, leftVal);
                    result[leftIdx] = updateCellValue(leftCell, newVal);
                    result[currentIdx] = makeEmpty(currentCell);
                    mergedFlags[leftIdx] = true;
                    break;
                }
            }
            break;
        }
    }

    return { grid: result, merged: mergedFlags };
};

/**
 * Process a chunk that may contain locked tiles.
 */
const processChunkWithLocked = (chunk: Cell[]): ProcessResult => {
    // 1. Find the first Locked Cell
    const firstLockedIdx = chunk.findIndex(c => isLocked(c));

    // If no locked cells, just use the standard slider
    if (firstLockedIdx === -1) {
        return slideAndMergeWithSticky(chunk);
    }

    const lockedCell = chunk[firstLockedIdx] as LockedCell;
    const leftPart = chunk.slice(0, firstLockedIdx);
    const rightPart = chunk.slice(firstLockedIdx + 1);

    // Process Left (Standard slide)
    const leftRes = slideAndMergeWithSticky(leftPart);

    // Process Right (Recursive)
    const rightRes = processChunkWithLocked(rightPart);

    // Check if the first tile of the processed Right part can merge into this Locked cell
    const incomingTileIdx = rightRes.grid.findIndex(c => getCellValue(c) !== 0);
    const incomingTile = incomingTileIdx !== -1 ? rightRes.grid[incomingTileIdx] : 0;
    const isIncomingMerged = incomingTileIdx !== -1 ? rightRes.merged[incomingTileIdx] : false;

    // Check if incoming tile is stuck (just entered a sticky cell this turn)
    let isJustStuck = false;
    if (incomingTileIdx === 0 && isSticky(incomingTile)) {
        const originalCell = rightPart[incomingTileIdx];
        if (getCellValue(originalCell) === 0) {
            isJustStuck = true;
        }
    }

    // Determine if we should merge OR trap
    // Changed type to Cell | null to allow returning Objects (LockedCell)
    let mergedCell: Cell | null = null;
    const valIn = getCellValue(incomingTile);
    const valLocked = getCellValue(lockedCell);

    // Logic:
    // 1. If Locked Cell is 0 (L(0)), it acts as a trap for any valid number tile.
    // 2. Otherwise, standard merge rules apply (must match values).
    // 3. Generators cannot move/merge into locks.
    if (incomingTile !== 0 && incomingTileIdx === 0 && !isLocked(incomingTile) && !isGenerator(incomingTile) && !isIncomingMerged && !isJustStuck) {
        if (valLocked === 0) {
            // Trap: L(0) takes the value of the incoming tile
            // FIX: Return a LockedCell object so it stays locked
            mergedCell = { ...lockedCell, value: valIn };
        } else if (canMerge(incomingTile, lockedCell)) {
            // Merge: Combine values (Standard behavior: unlocks to a number)
            mergedCell = getMergeResult(valIn, valLocked);
        }
    }

    if (mergedCell !== null) {
        // --- MERGE / TRAP EXECUTED ---

        // Remove the tile that merged from the right side
        const rightGridMod = [...rightRes.grid];
        rightGridMod[incomingTileIdx] = makeEmpty(incomingTile);

        // Recursively process the remainder
        const compactedRight = processChunkWithLocked(rightGridMod);

        // Result: The locked tile updates its value
        return {
            grid: [...leftRes.grid, mergedCell, ...compactedRight.grid],
            merged: [...leftRes.merged, true, ...compactedRight.merged]
        };
    } else {
        // No merge -> Keep the locked cell as is
        return {
            grid: [...leftRes.grid, lockedCell, ...rightRes.grid],
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
            let processingInput = [...buffer];
            if (isGenerator(cell)) {
                processingInput.push(cell.value);
            }

            let processedRes = processChunkWithLocked(processingInput);

            let processed = processedRes.grid;
            if (isGenerator(cell)) {
                processed.pop();
            }

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
        let processedRes = processChunkWithLocked(buffer);
        let processed = processedRes.grid;
        while (processed.length < buffer.length) processed.push(0);
        result.push(...processed);
    }

    return result;
};