// src/components/LevelEditor/EditorGrid.tsx
import React from 'react';
import Tile from '../Tile';
import type { Grid} from '../../types/types';
import type { EditorTool } from '../../types/editorTypes';

interface EditorGridProps {
    grid: Grid;
    rows: number;
    cols: number;
    thinWalls: { vertical: [number, number][]; horizontal: [number, number][] };
    selectedTool: EditorTool;
    onCellClick: (r: number, c: number) => void;
}

export const EditorGrid: React.FC<EditorGridProps> = ({
    grid,
    rows,
    cols,
    thinWalls,
    selectedTool,
    onCellClick
}) => {
    const boardSize = Math.max(rows, cols); // Used for Tile font sizing logic

    // Calculate grid gaps
    let gapClass = 'gap-3';
    let indicatorOffset = 6;
    if (boardSize > 5) {
        gapClass = 'gap-1';
        indicatorOffset = 4;
    } else if (boardSize > 4) {
        gapClass = 'gap-2';
        indicatorOffset = 5;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] bg-slate-100 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <div className="bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full max-w-[400px]">
                <div
                    className={`grid ${gapClass} relative mx-auto`}
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`, // Use COLS
                        gridTemplateRows: `repeat(${rows}, 1fr)`,    // Use ROWS
                        width: '100%',
                        aspectRatio: `${cols}/${rows}` // Dynamic Aspect Ratio
                    }}
                >
                    {grid.map((row, r) => row.map((cell, c) => (
                        <button
                            key={`${r}-${c}`}
                            onClick={() => onCellClick(r, c)}
                            className="relative w-full h-full hover:ring-2 hover:ring-purple-400 rounded-lg transition active:scale-95"
                        >
                            <Tile value={cell} boardSize={boardSize} />

                            {/* Thin Wall Indicators */}
                            {thinWalls.vertical.map(([wr, wc], i) => (wr === r && wc === c) && (
                                <div
                                    key={`v-${i}`}
                                    className="absolute top-0 bottom-0 w-[6px] bg-slate-800 dark:bg-slate-200 rounded-full z-20 pointer-events-none shadow-sm border border-white/20"
                                    style={{ right: `-${indicatorOffset}px` }}
                                />
                            ))}
                            {thinWalls.horizontal.map(([wr, wc], i) => (wr === r && wc === c) && (
                                <div
                                    key={`h-${i}`}
                                    className="absolute left-0 right-0 h-[6px] bg-slate-800 dark:bg-slate-200 rounded-full z-20 pointer-events-none shadow-sm border border-white/20"
                                    style={{ bottom: `-${indicatorOffset}px` }}
                                />
                            ))}
                        </button>
                    )))}
                </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
                Selected: <span className="font-bold text-indigo-600">{selectedTool.label}</span>
            </p>
        </div>
    );
};