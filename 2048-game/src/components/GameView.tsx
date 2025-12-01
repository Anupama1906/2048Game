// src/components/GameView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, ChevronRight, Sparkles, BrainCircuit, X, Loader2, Trophy, Lock, RefreshCw, Star, Factory, Magnet } from 'lucide-react';
import type { Level, Cell } from '../types/types';
import { TILE_COLORS } from '../constants/theme';
import { WALL } from '../constants/game';
import { useGame } from '../hooks/usegame';
import { callGemini } from '../utils/utils';

interface GameViewProps {
    level: Level;
    bestScore?: number;
    onBack: () => void;
    onComplete: (moves: number) => void;
}

const GameView: React.FC<GameViewProps> = ({ level, bestScore, onBack, onComplete }) => {
    // 1. Use the Hook
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);

    // 2. UI State
    const [showHintModal, setShowHintModal] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const touchEnd = useRef<{ x: number; y: number } | null>(null);

    // FIX 1: Ensure rows/cols are never 0 (fallback to level data if hook hasn't loaded yet)
    const currentGrid = grid.length > 0 ? grid : level.grid;
    const rows = currentGrid.length;
    const cols = currentGrid[0]?.length || 0;

    // FIX 2: Define boardSize for font scaling logic
    const boardSize = Math.max(rows, cols);

    // Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showHintModal) return;
            switch (e.key) {
                case 'ArrowUp': move('UP'); break;
                case 'ArrowDown': move('DOWN'); break;
                case 'ArrowLeft': move('LEFT'); break;
                case 'ArrowRight': move('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move, showHintModal]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }
    }
    const onTouchMove = (e: React.TouchEvent) => { touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY } }
    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const dx = touchStart.current.x - touchEnd.current.x;
        const dy = touchStart.current.y - touchEnd.current.y;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) { dx > 0 ? move('LEFT') : move('RIGHT'); }
        else if (Math.abs(dy) > 30) { dy > 0 ? move('UP') : move('DOWN'); }
    }

    const handleAiHint = async () => {
        setAiResponse("");
        setIsLoadingAi(true);
        try {
            const prompt = `I am playing a 2048 puzzle. Current Grid: ${JSON.stringify(grid)}. Target: ${level.target}. Moves taken: ${moves}. Give me a short hint.`;
            const response = await callGemini(prompt, "You are a puzzle coach.");
            setAiResponse(response);
        } catch (error) {
            setAiResponse("Hint unavailable.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    // Render Helpers
    const cellWidthPct = 100 / cols;
    const cellHeightPct = 100 / rows;
    const gapRem = 0.75;

    const getFontSize = (val: number) => {
        const len = val.toString().length;
        if (boardSize <= 3) return len > 3 ? 'text-4xl' : 'text-5xl';
        if (boardSize === 4) return len > 3 ? 'text-3xl' : 'text-4xl';
        if (boardSize === 5) return len > 3 ? 'text-xl' : 'text-2xl';
        return len > 3 ? 'text-xs' : 'text-sm';
    };

    const Tile = ({ value }: { value: Cell }) => {
        if (value === 0) return <div className="w-full h-full rounded-lg bg-gray-200/50 dark:bg-gray-700/50" />;

        if (value === WALL) return (
            <div className="w-full h-full rounded-lg bg-slate-700 shadow-inner flex items-center justify-center border-4 border-slate-800 dark:border-slate-900">
                <Lock className="text-slate-500 w-6 h-6" />
            </div>
        );

        let displayValue: number;
        let isStationary = false;
        let isGenerator = false;
        let isSticky = false;

        if (typeof value === 'object') {
            displayValue = value.value;
            if (value.type === 'stationary') isStationary = true;
            if (value.type === 'generator') isGenerator = true;
            if (value.type === 'sticky') isSticky = true;
        } else {
            displayValue = value;
        }

        const fontSizeClass = getFontSize(displayValue);

        let extraStyle = "";
        if (isStationary) {
            extraStyle = "border-4 border-slate-400 dark:border-slate-500 ring-2 ring-slate-200 dark:ring-slate-700 z-10";
        } else if (isGenerator) {
            extraStyle = "border-4 border-dashed border-slate-600 dark:border-slate-400 z-10";
        } else if (isSticky) {
            // New Style for Sticky: Red/Pinkish border to look "magnetic" or "trapping"
            extraStyle = "border-4 border-red-400 dark:border-red-500 z-10";
        }

        // Render Logic for Empty Sticky Cell (P(0))
        if (isSticky && displayValue === 0) {
            return (
                <div className="w-full h-full rounded-lg bg-red-100/50 dark:bg-red-900/30 border-4 border-red-300 dark:border-red-700 border-dashed flex items-center justify-center">
                    <Magnet className="text-red-400 dark:text-red-500 opacity-50" size={24} />
                </div>
            );
        }


        return (
            <div className={`w-full h-full rounded-lg ${TILE_COLORS[displayValue] || 'bg-gray-900 text-white'} ${extraStyle} shadow-sm flex items-center justify-center font-bold ${fontSizeClass} select-none animate-in zoom-in duration-200 relative overflow-hidden`}>
                {displayValue}
                {isStationary && (
                    <div className="absolute top-1 right-1 opacity-60">
                        <Lock size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    </div>
                )}
                {isGenerator && (
                    <div className="absolute top-1 right-1 opacity-60">
                        <Factory size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    </div>
                )}
                {isSticky && (
                    <div className="absolute top-1 right-1 opacity-60">
                        <Magnet size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-full min-h-[500px] px-5 sm:px-4 lg:px-0">
            {/* Hint Modal */}
            {showHintModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setShowHintModal(false)} className="absolute top-4 right-4 text-slate-400"><X size={20} /></button>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><BrainCircuit /> AI Coach</h3>
                        {aiResponse ? (
                            <p className="text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">{aiResponse}</p>
                        ) : (
                            <div className="text-center py-4">
                                {isLoadingAi ? <Loader2 className="animate-spin mx-auto text-indigo-500" /> :
                                    <button onClick={handleAiHint} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">Analyze Board</button>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ChevronRight className="rotate-180" size={20} /> <span className="text-sm font-bold">Back</span>
                </button>

                <div className="flex gap-4 md:gap-8">
                    {/* Moves */}
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Moves</div>
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{moves}</div>
                    </div>

                    {/* Best Score */}
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 justify-end">
                            Best
                            {level.par && bestScore && bestScore <= level.par && <Star size={10} className="fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
                            {bestScore !== undefined ? bestScore : '-'}
                        </div>
                    </div>

                    {/* Target */}
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

            {/* Board Container */}
            {/* FIX 3: Added flex center and min-height to ensure overlay fits even if grid is small */}
            <div className="relative bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full mb-6 touch-none flex flex-col items-center justify-center min-h-[320px]"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

                {/* Grid Div: Removed h-full so it takes natural height from aspect ratio, while container stretches */}
                <div className="grid gap-3 w-full relative z-0"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                        aspectRatio: `${cols}/${rows}` // Keeps cells square
                    }}>
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className="relative w-full h-full">
                            <Tile value={cell} />
                        </div>
                    )))}

                    {/* Walls Rendering */}
                    {level.thinWalls?.vertical?.map(([r, c], i) => (
                        <div key={`v-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                width: '6px',
                                height: `calc(${cellHeightPct}% - 1.25*${gapRem}rem)`,
                                top: `calc(${r * cellHeightPct}% + ${gapRem / 2}rem)`,
                                left: `calc(${(c + 1) * cellWidthPct}% - ${gapRem / 2}rem )`
                            }} />
                    ))}
                    {level.thinWalls?.horizontal?.map(([r, c], i) => (
                        <div key={`h-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm"
                            style={{
                                height: '6px',
                                width: `calc(${cellWidthPct}% - ${gapRem}rem)`,
                                left: `calc(${c * cellWidthPct}% + ${gapRem / 2}rem)`,
                                top: `calc(${(r + 1) * cellHeightPct}% - ${gapRem / 2}rem )`
                            }} />
                    ))}
                </div>

                {/* Overlays */}
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-in fade-in">
                        {gameState === 'won' ? (
                            <>
                                <Trophy size={64} className="text-yellow-500 mb-4" />
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Solved!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">in {moves} moves</p>
                                <button onClick={() => onComplete(moves)} className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                                    Next Level
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-4">😔</div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Stuck?</h2>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={undo} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-6 rounded-lg">Undo</button>
                                    <button type="button" onClick={reset} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg">Retry</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex gap-4 w-full justify-center">
                <button onClick={undo} disabled={!canUndo} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-50 transition"><RotateCcw size={20} /></button>
                <button onClick={reset} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition"><RefreshCw size={20} /></button>
                <button onClick={() => setShowHintModal(true)} className="p-3 bg-indigo-100 dark:bg-indigo-900/50 shadow rounded-xl text-indigo-600 dark:text-indigo-300 flex items-center gap-2 font-semibold transition"><Sparkles size={18} /> Hint</button>
            </div>
        </div>
    );
};

export default GameView;