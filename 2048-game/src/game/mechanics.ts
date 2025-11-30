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

// Internal Interface for processing with metadata
interface ProcessResult {
    grid: Cell[];
    merged: boolean[]; // Tracks if a tile at index i was created by a merge in this step
}

/**
 * Standard 2048 Logic - slides tiles left and merges
 * Returns metadata about which tiles were merged
 */
const slideAndMergeWithStatus = (tiles: Cell[]): ProcessResult => {
    let result: Cell[] = [];
    let mergedFlags: boolean[] = [];
    let i = 0;

    while (i < tiles.length) {
        const current = tiles[i];
        const next = tiles[i + 1];

        if (next !== undefined && canMerge(current, next)) {
            // Merge the two tiles
            const valA = getCellValue(current);
            const valB = getCellValue(next);
            const mergedVal = getMergeResult(valA, valB);

            // Only add to result if it didn't cancel out to 0
            if (mergedVal !== 0) {
                result.push(mergedVal);
                mergedFlags.push(true); // Mark as newly merged
            }

            i += 2; // Skip both tiles
        } else {
            // No merge, just add current
            result.push(current);
            mergedFlags.push(false); // Existing tile slid
            i += 1;
        }
    }

    return { grid: result, merged: mergedFlags };
};

/**
 * Process a chunk that may contain stationary tiles
 */
const processChunkWithStatus = (chunk: Cell[]): ProcessResult => {
    const firstStatIdx = chunk.findIndex(c => isStationary(c));

    if (firstStatIdx === -1) {
        const movable = chunk.filter(c => getCellValue(c) !== 0);
        const { grid, merged } = slideAndMergeWithStatus(movable);

        // Pad with zeros to restore length
        const finalGrid = [...grid];
        const finalMerged = [...merged];
        while (finalGrid.length < chunk.length) {
            finalGrid.push(0);
            finalMerged.push(false);
        }
        return { grid: finalGrid, merged: finalMerged };
    }

    const stationaryCell = chunk[firstStatIdx] as StationaryCell;
    const leftPart = chunk.slice(0, firstStatIdx);
    const rightPart = chunk.slice(firstStatIdx + 1);

    // 1. Process Left Side
    const leftMovable = leftPart.filter(c => getCellValue(c) !== 0);
    const leftRes = slideAndMergeWithStatus(leftMovable);
    const leftGrid = [...leftRes.grid];
    const leftMerged = [...leftRes.merged];
    while (leftGrid.length < leftPart.length) {
        leftGrid.push(0);
        leftMerged.push(false);
    }

    // 2. Process Right Side (Recursively)
    const rightRes = processChunkWithStatus(rightPart);

    // 3. Check interaction between Right Side and Stationary Cell
    const incomingTileIdx = rightRes.grid.findIndex(c => getCellValue(c) !== 0);
    const incomingTile = incomingTileIdx !== -1 ? rightRes.grid[incomingTileIdx] : 0;
    const isIncomingMerged = incomingTileIdx !== -1 ? rightRes.merged[incomingTileIdx] : false;

    // Check if we can merge the incoming tile into the stationary one
    // CRITICAL FIX: Do NOT merge if the incoming tile was *already* merged in this step.
    if (incomingTile !== 0 &&
        !isStationary(incomingTile) &&
        !isIncomingMerged && // <--- Prevents double merge (e.g. 4+4=8, then 8+s(8)=16 in one move)
        canMerge(incomingTile, stationaryCell)) {

        const valIn = getCellValue(incomingTile);
        const valStat = getCellValue(stationaryCell);
        const mergedValue = getMergeResult(valIn, valStat);

        // Remove incoming tile from right side (it merged into stationary position)
        const rightRemainderGrid = [...rightRes.grid];
        rightRemainderGrid[incomingTileIdx] = 0; // Replace with empty space

        // Re-compact the right side to fill the gap
        // Since we are in a "slide" phase, holes should be filled immediately
        const compactedRight = processChunkWithStatus(rightRemainderGrid);

        return {
            grid: [...leftGrid, mergedValue, ...compactedRight.grid],
            merged: [...leftMerged, true, ...compactedRight.merged] // stationary slot is now "merged"
        };
    } else {
        // No merge with stationary (either blocked, mismatch, or incoming was already merged)
        return {
            grid: [...leftGrid, stationaryCell, ...rightRes.grid],
            merged: [...leftMerged, false, ...rightRes.merged]
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

            // Process the buffer (chunk)
            let processedRes = processChunkWithStatus(processingInput);
            let processed = processedRes.grid;

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
        let processedRes = processChunkWithStatus(buffer);
        let processed = processedRes.grid;
        while (processed.length < buffer.length) processed.push(0);
        result.push(...processed);
    }

    return result;
};