// src/game/mechanics.ts
import type { Cell, StationaryCell, GeneratorCell } from '../types/types';
import { WALL } from '../constants/game';

/**
 * MECHANICS CONFIGURATION
 */

// Helper: Check if a cell is stationary
export const isStationary = (cell: Cell): cell is StationaryCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'stationary';
};

// Helper: Check if a cell is a generator
export const isGenerator = (cell: Cell): cell is GeneratorCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'generator';
};

// Helper: Get numeric value of any cell (returns 0 for walls/empty)
export const getCellValue = (cell: Cell): number => {
    if (typeof cell === 'number') return cell;
    if (isStationary(cell)) return cell.value;
    if (isGenerator(cell)) return cell.value;
    return 0;
};

// Rule: Can tile A merge into tile B?
export const canMerge = (a: Cell, b: Cell): boolean => {
    if (a === WALL || b === WALL) return false;
    if (isGenerator(a) || isGenerator(b)) return false;

    const valA = getCellValue(a);
    const valB = getCellValue(b);
    if (valA === 0 || valB === 0) return false;

    // 1. Same value (e.g. 2 and 2, or -2 and -2)
    // 2. Opposite value (e.g. 2 and -2) -> Cancel out
    return valA === valB || valA === -valB;
};

// Rule: What happens when they merge?
export const getMergeResult = (valA: number, valB: number): number => {
    if (valA === -valB) return 0; // Cancel out
    return valA * 2; // Standard merge (preserves sign)
};

// Rule: Is this cell a Hard Obstacle (Wall or Generator)?
export const isHardObstacle = (cell: Cell): boolean => {
    return cell === WALL || isGenerator(cell);
};

/**
 * Standard 2048 Logic - slides tiles left and merges
 */
const slideAndMergeSimple = (tiles: Cell[]): Cell[] => {
    let result: Cell[] = [];
    let i = 0;

    while (i < tiles.length) {
        const current = tiles[i];
        const next = tiles[i + 1];

        if (next !== undefined && canMerge(current, next)) {
            // Merge the two tiles
            const valA = getCellValue(current);
            const valB = getCellValue(next);
            const merged = getMergeResult(valA, valB);

            // Only add to result if it didn't cancel out to 0
            if (merged !== 0) {
                result.push(merged);
            }

            i += 2; // Skip both tiles
        } else {
            // No merge, just add current
            result.push(current);
            i += 1;
        }
    }

    return result;
};

/**
 * Process a chunk that may contain stationary tiles
 */
const processChunkWithStationary = (chunk: Cell[]): Cell[] => {
    const firstStatIdx = chunk.findIndex(c => isStationary(c));

    if (firstStatIdx === -1) {
        const movable = chunk.filter(c => getCellValue(c) !== 0);
        const processed = slideAndMergeSimple(movable);
        while (processed.length < chunk.length) processed.push(0);
        return processed;
    }

    const stationaryCell = chunk[firstStatIdx] as StationaryCell;
    const leftPart = chunk.slice(0, firstStatIdx);
    const rightPart = chunk.slice(firstStatIdx + 1);

    const leftMovable = leftPart.filter(c => getCellValue(c) !== 0);
    let leftResult = slideAndMergeSimple(leftMovable);
    while (leftResult.length < leftPart.length) leftResult.push(0);

    const rightResult = processChunkWithStationary(rightPart);

    const incomingTileIdx = rightResult.findIndex(c => getCellValue(c) !== 0);
    const incomingTile = incomingTileIdx !== -1 ? rightResult[incomingTileIdx] : 0;

    if (incomingTile !== 0 && canMerge(incomingTile, stationaryCell)) {
        const valIn = getCellValue(incomingTile);
        const valStat = getCellValue(stationaryCell);
        const mergedValue = getMergeResult(valIn, valStat);

        const rightRemainder = [...rightResult];
        rightRemainder[incomingTileIdx] = 0;

        // If mergedValue is 0 (cancelled), it acts as an empty space (0) in the sequence
        const newSequence = [...leftResult, mergedValue, ...rightRemainder];
        return processChunkWithStationary(newSequence);
    } else {
        return [...leftResult, stationaryCell, ...rightResult];
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

            let processed = processChunkWithStationary(processingInput);

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
        let processed = processChunkWithStationary(buffer);
        while (processed.length < buffer.length) processed.push(0);
        result.push(...processed);
    }

    return result;
};