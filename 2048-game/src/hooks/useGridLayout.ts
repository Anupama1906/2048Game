// src/hooks/useGridLayout.ts
import { useMemo } from 'react';
import type { Grid } from '../types/types';

interface GridLayoutResult {
    rows: number;
    cols: number;
    boardSize: number;
    gapClass: string;
    gapRem: number;
}

export const useGridLayout = (grid: Grid): GridLayoutResult => {
    return useMemo(() => {
        const rows = grid.length;
        const cols = grid[0]?.length || 0;
        const boardSize = Math.max(rows, cols);

        let gapClass = 'gap-3';
        let gapRem = 0.75;

        if (boardSize > 6) {
            gapClass = 'gap-1';
            gapRem = 0.25;
        } else if (boardSize > 4) {
            gapClass = 'gap-2';
            gapRem = 0.5;
        }

        return { rows, cols, boardSize, gapClass, gapRem };
    }, [grid]);
};