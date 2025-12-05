// src/components/shared/GameBoard.tsx
import React, { useMemo } from 'react';
import { RotateCcw, ChevronRight, RefreshCw } from 'lucide-react';
import type { Level, Grid, GameState } from '../../types/types';
import Tile from '../Tile';

interface GameBoardProps {
    level: Level;
    grid: Grid;
    gameState: GameState;
    moves: number;
    onBack: () => void;
    // onMove is kept for type compatibility, even though logic is now handled by hooks in the parent
    onMove: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
    onUndo: () => void;
    onReset: () => void;
    canUndo: boolean;

    // ADDED: Accept touch handlers from the parent hook
    touchHandlers?: {
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: () => void;
    };

    // Optional customization
    headerExtra?: React.ReactNode;
    winOverlay?: React.ReactNode;
    lostOverlay?: React.ReactNode;
    additionalControls?: React.ReactNode;
}

export const GameBoard: React.FC<GameBoardProps> = ({
    level,
    grid,
    gameState,
    moves,
    onBack,
    onUndo,
    onReset,
    canUndo,
    touchHandlers, // Destructure the new prop
    headerExtra,
    winOverlay,
    lostOverlay,
    additionalControls
}) => {

    // Layout logic
    const currentGrid = grid.length > 0 ? grid : level.grid;
    const rows = currentGrid.length;
    const cols = currentGrid[0]?.length || 0;
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

    // Memoize grid rendering
    const memoizedGrid = useMemo(() => {
        return grid.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} className="relative w-full h-full">
                <Tile value={cell} boardSize={boardSize} />
            </div>
        )));
    }, [grid, boardSize]);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-full min-h-[500px] px-5 sm:px-4 lg:px-0">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 flex items-center gap-1"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span className="text-sm font-bold">Back</span>
                </button>

                <div className="flex gap-4 md:gap-8">
                    {headerExtra}
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Moves</div>
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{moves}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target</div>
                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{level.target}</div>
                    </div>
                </div>
            </div>

            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{level.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{level.description}</p>
            </div>

            {/* Board */}
            <div
                className="relative bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full mb-6 touch-none flex flex-col items-center justify-center min-h-[320px]"
                // Apply the passed touch handlers here
                {...(touchHandlers || {})}
            >
                <div
                    className={`grid ${gapClass} w-full relative z-0`}
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                        aspectRatio: `${cols}/${rows}`
                    }}
                >
                    {memoizedGrid}

                    {/* Thin Walls Rendering */}
                    {level.thinWalls?.vertical?.map(([r, c], i) => (
                        <div
                            key={`v-${i}`}
                            className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                width: '6px',
                                height: `calc(${100 / rows}% - ${1.25 * gapRem}rem)`,
                                top: `calc(${r * 100 / rows}% + ${gapRem}rem * (${r / rows} + 0.5))`,
                                left: `calc( ${(c + 1) * 100 / cols}% + ${gapRem}rem * (${(c + 1) / cols} - 0.5) - 3px )`
                            }}
                        />
                    ))}
                    {level.thinWalls?.horizontal?.map(([r, c], i) => (
                        <div
                            key={`h-${i}`}
                            className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                height: '6px',
                                width: `calc(${100 / cols}% - ${gapRem}rem)`,
                                left: `calc(${c * 100 / cols}% + ${gapRem}rem * (${c / cols} + 0.5))`,
                                top: `calc( ${(r + 1) * 100 / rows}% + ${gapRem}rem * (${(r + 1) / rows} - 0.5) - 3px )`
                            }}
                        />
                    ))}
                </div>

                {/* Overlays */}
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-in fade-in">
                        {gameState === 'won' ? winOverlay : lostOverlay}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full justify-center">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-50 transition"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={onReset}
                    className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition"
                >
                    <RefreshCw size={20} />
                </button>
                {additionalControls}
            </div>
        </div>
    );
};