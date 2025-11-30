import type { Cell, StationaryCell } from '../types/types';
import { WALL } from '../constants/game';

/**
 * MECHANICS CONFIGURATION
 */

// Helper: Check if a cell is stationary
export const isStationary = (cell: Cell): cell is StationaryCell => {
    return typeof cell === 'object' && cell !== null && (cell as any).type === 'stationary';
};

// Helper: Get numeric value of any cell (returns 0 for walls/empty)
export const getCellValue = (cell: Cell): number => {
    if (typeof cell === 'number') return cell;
    if (isStationary(cell)) return cell.value;
    return 0;
};

// Rule: Can tile A merge into tile B?
export const canMerge = (a: Cell, b: Cell): boolean => {
    if (a === WALL || b === WALL) return false;
    const valA = getCellValue(a);
    const valB = getCellValue(b);
    if (valA === 0 || valB === 0) return false;
    return valA === valB;
};

// Rule: What happens when they merge?
export const getMergeResult = (val: number): number => {
    return val * 2;
};

// Rule: Is this cell a Hard Obstacle (Wall)?
export const isHardObstacle = (cell: Cell): boolean => {
    return cell === WALL;
};

/**
 * Standard 2048 Logic - slides tiles left and merges
 * Expects an array of tiles WITHOUT zeros (gaps).
 */
const slideAndMergeSimple = (tiles: Cell[]): Cell[] => {
    let result: Cell[] = [];
    let i = 0;

    while (i < tiles.length) {
        const current = tiles[i];
        const next = tiles[i + 1];

        if (next !== undefined && canMerge(current, next)) {
            // Merge the two tiles
            result.push(getMergeResult(getCellValue(current)));
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
 * Logic: Stationary tiles act as barriers (Walls).
 * However, if a tile sliding towards a stationary tile matches its value,
 * it merges with the stationary tile, unpinning it (converting it to a normal tile).
 */
const processChunkWithStationary = (chunk: Cell[]): Cell[] => {
    // 1. Find the first Stationary Cell in this chunk
    const firstStatIdx = chunk.findIndex(c => isStationary(c));

    // Base Case: No stationary tiles, just process normally
    if (firstStatIdx === -1) {
        // Filter out zeros to simulate sliding
        const movable = chunk.filter(c => getCellValue(c) !== 0);
        const processed = slideAndMergeSimple(movable);
        // Pad with 0s to maintain segment length
        while (processed.length < chunk.length) processed.push(0);
        return processed;
    }

    // 2. Split the chunk around the stationary tile
    const stationaryCell = chunk[firstStatIdx] as StationaryCell;
    const leftPart = chunk.slice(0, firstStatIdx);
    const rightPart = chunk.slice(firstStatIdx + 1);

    // 3. Process the Left side (guaranteed no stationary tiles due to findIndex)
    const leftMovable = leftPart.filter(c => getCellValue(c) !== 0);
    let leftResult = slideAndMergeSimple(leftMovable);
    while (leftResult.length < leftPart.length) leftResult.push(0);

    // 4. Process the Right side (recursively, might contain more stationary tiles)
    // The right side slides internally towards the left (towards our stationary wall)
    const rightResult = processChunkWithStationary(rightPart);

    // 5. Check interaction with the stationary tile
    // Look for the leading tile from the right result (first non-zero)
    const incomingTileIdx = rightResult.findIndex(c => getCellValue(c) !== 0);
    const incomingTile = incomingTileIdx !== -1 ? rightResult[incomingTileIdx] : 0;

    if (incomingTile !== 0 && canMerge(incomingTile, stationaryCell)) {
        // MERGE: The incoming tile hits the stationary tile and matches!
        const mergedValue = getMergeResult(getCellValue(incomingTile));

        // Consume the incoming tile from the right result
        const rightRemainder = [...rightResult];
        rightRemainder[incomingTileIdx] = 0;

        // Construct a new sequence: LeftResult + MergedTile + RightRemainder
        // The stationary tile is replaced by 'mergedValue' (a normal number).
        // The barrier is gone, so we must re-process the entire sequence 
        // to allow the new tile (and subsequent ones) to slide further left if possible.
        const newSequence = [...leftResult, mergedValue, ...rightRemainder];

        return processChunkWithStationary(newSequence);
    } else {
        // NO MERGE: The stationary tile acts as a solid wall.
        // Tiles on the right are blocked.
        return [...leftResult, stationaryCell, ...rightResult];
    }
};

/**
 * Process a single row (slide & merge).
 * Handles Walls (hard segments) and Stationary Tiles (soft/mergeable segments).
 */
export const processRow = (line: Cell[]): Cell[] => {
    // 1. Break line into segments separated by hard WALLs
    let segments: Cell[][] = [];
    let currentSegment: Cell[] = [];

    for (let cell of line) {
        if (isHardObstacle(cell)) {
            if (currentSegment.length > 0) {
                segments.push(currentSegment);
                currentSegment = [];
            }
            segments.push([WALL]);
        } else {
            currentSegment.push(cell);
        }
    }
    if (currentSegment.length > 0) {
        segments.push(currentSegment);
    }

    // 2. Process each segment
    let processedLine: Cell[] = [];

    segments.forEach(seg => {
        if (seg[0] === WALL) {
            processedLine.push(WALL);
        } else {
            // Process this segment (may contain stationary tiles)
            const processed = processChunkWithStationary(seg);
            processedLine = processedLine.concat(processed);
        }
    });

    return processedLine;
};