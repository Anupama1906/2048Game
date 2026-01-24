// src/utils/gridSerialization.ts
import type { Grid } from '../types/types';

export const serializeGrid = (grid: Grid): any[][] => {
    return grid.map(row =>
        row.map(cell => {
            // Check if it's a special cell object (not a number or string)
            if (typeof cell === 'object' && cell !== null) {
                return { _type: 'object', ...cell };
            }
            return cell;
        })
    );
};

export const deserializeGrid = (rawGrid: any): Grid => {
    let processedGrid = rawGrid;

    // Handle legacy or specific cases where grid is stored as a JSON string
    if (typeof rawGrid === 'string') {
        try {
            processedGrid = JSON.parse(rawGrid);
        } catch (e) {
            console.error('Grid parse error', e);
            return [];
        }
    }

    if (!Array.isArray(processedGrid)) return [];

    return processedGrid.map((row: any[]) =>
        row.map((cell: any) => {
            // Restore object cells by removing the _type wrapper
            if (typeof cell === 'object' && cell !== null && cell._type === 'object') {
                const { _type, ...rest } = cell;
                return rest;
            }
            return cell;
        })
    );
};