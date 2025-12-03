// src/components/CustomLevelTestView.tsx
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, ChevronRight, Trophy, RefreshCw, CheckCircle, Edit2 } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { useGame } from '../hooks/usegame';
import Tile from './Tile';
import { saveLevel } from '../services/customLevelsStorage';

interface CustomLevelTestViewProps {
    level: CustomLevel;
    onBack: () => void;
    onEdit: () => void; // New prop
    onVerified: () => void;
}

const CustomLevelTestView: React.FC<CustomLevelTestViewProps> = ({ level, onBack, onEdit, onVerified }) => {
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);
    const hasVerified = useRef(false);

    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const touchEnd = useRef<{ x: number; y: number } | null>(null);
    const lastMoveTime = useRef(0);
    const MOVE_DELAY = 100;

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

    // Auto-verify on win
    useEffect(() => {
        if (gameState === 'won' && !hasVerified.current && !level.isVerified) {
            hasVerified.current = true;

            // Mark level as verified
            const verifiedLevel: CustomLevel = {
                ...level,
                isVerified: true,
                lastModified: new Date().toISOString()
            };

            saveLevel(verifiedLevel);
            console.log('✅ Level verified!');
        }
    }, [gameState, level]);

    const throttledMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        const now = Date.now();
        if (now - lastMoveTime.current < MOVE_DELAY) return;
        lastMoveTime.current = now;
        move(direction);
    }, [move]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'ArrowUp': throttledMove('UP'); break;
                case 'ArrowDown': throttledMove('DOWN'); break;
                case 'ArrowLeft': throttledMove('LEFT'); break;
                case 'ArrowRight': throttledMove('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [throttledMove]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const dx = touchStart.current.x - touchEnd.current.x;
        const dy = touchStart.current.y - touchEnd.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            dx > 0 ? throttledMove('LEFT') : throttledMove('RIGHT');
        } else {
            dy > 0 ? throttledMove('UP') : throttledMove('DOWN');
        }
    };

    const memoizedGrid = useMemo(() => {
        return grid.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} className="relative w-full h-full">
                <Tile value={cell} boardSize={boardSize} />
            </div>
        )));
    }, [grid, boardSize]);

    const handleBackToEditor = () => {
        if (gameState === 'won') {
            onVerified();
        } else {
            onBack();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-full min-h-[500px] px-5 sm:px-4 lg:px-0">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button onClick={handleBackToEditor} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <ChevronRight className="rotate-180" size={20} />
                        <span className="text-sm font-bold">Back</span>
                    </button>
                    {/* NEW EDIT BUTTON */}
                    <button onClick={onEdit} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Edit2 size={20} />
                        <span className="text-sm font-bold">Edit</span>
                    </button>
                </div>

                <div className="flex gap-4 md:gap-8">
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
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{level.name}</h2>
                    {level.isVerified && (
                        <CheckCircle size={24} className="text-green-500" />
                    )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {level.isVerified ? 'Verified Level' : 'Testing Mode - Win to verify'}
                </p>
            </div>

            {/* Board */}
            <div className="relative bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full mb-6 touch-none flex flex-col items-center justify-center min-h-[320px]"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

                <div className={`grid ${gapClass} w-full relative z-0`}
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                        aspectRatio: `${cols}/${rows}`
                    }}>
                    {memoizedGrid}

                    {/* NEW: Render Thin Walls in Test Mode */}
                    {level.thinWalls?.vertical?.map(([r, c], i) => (
                        <div key={`v-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                width: '6px',
                                height: `calc(${100 / rows}% - ${1.25 * gapRem}rem)`,
                                top: `calc(${r * 100 / rows}% + ${gapRem}rem * (${r / rows} + 0.5))`,
                                left: `calc( ${(c + 1) * 100 / cols}% + ${gapRem}rem * (${(c + 1) / cols} - 0.5) - 3px )`
                            }} />
                    ))}
                    {level.thinWalls?.horizontal?.map(([r, c], i) => (
                        <div key={`h-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                height: '6px',
                                width: `calc(${100 / cols}% - ${gapRem}rem)`,
                                left: `calc(${c * 100 / cols}% + ${gapRem}rem * (${c / cols} + 0.5))`,
                                top: `calc( ${(r + 1) * 100 / rows}% + ${gapRem}rem * (${(r + 1) / rows} - 0.5) - 3px )`
                            }} />
                    ))}
                </div>

                {/* Win/Loss Overlay */}
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-in fade-in">
                        {gameState === 'won' ? (
                            <>
                                <Trophy size={64} className="text-yellow-500 mb-4" />
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                    {!level.isVerified ? 'Level Verified!' : 'Solved!'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">
                                    Completed in {moves} moves
                                </p>
                                {!level.isVerified && (
                                    <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg mb-4">
                                        <p className="text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            Level can now be saved and shared!
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBackToEditor}
                                        className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
                                    >
                                        Back to Menu
                                    </button>
                                    <button
                                        onClick={onEdit}
                                        className="mt-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-4">😔</div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Try Again?</h2>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={undo} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-6 rounded-lg">
                                        Undo
                                    </button>
                                    <button type="button" onClick={reset} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg">
                                        Retry
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <button onClick={onEdit} className="text-sm text-slate-500 hover:text-indigo-500 underline flex items-center gap-1">
                                        <Edit2 size={14} /> Back to Editor
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full justify-center">
                <button onClick={undo} disabled={!canUndo} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-50 transition">
                    <RotateCcw size={20} />
                </button>
                <button onClick={reset} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition">
                    <RefreshCw size={20} />
                </button>
            </div>
        </div>
    );
};

export default CustomLevelTestView;