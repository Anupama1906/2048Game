// src/components/DailyGameView.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ChevronRight, Trophy, RefreshCw, Clock, Award, User } from 'lucide-react';
import type { Level } from '../types/types';
import { useGame } from '../hooks/usegame';
import Tile from './Tile';
import { useAuth } from '../contexts/AuthContext';
import { submitDailyScore, formatTime } from '../services/leaderboardService';
import LeaderboardModal from './LeaderboardModal';
import UsernameModal from './UsernameModal';

interface DailyGameViewProps {
    level: Level;
    onBack: () => void;
}

const DailyGameView: React.FC<DailyGameViewProps> = ({ level, onBack }) => {
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);
    const { user, username, setUsername } = useAuth();

    // Timer state
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Submission state
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

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

    // Start timer on first move
    useEffect(() => {
        if (moves > 0 && !isRunning && gameState === 'playing') {
            setIsRunning(true);
        }
    }, [moves, isRunning, gameState]);

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTime(prev => prev + 0.01);
            }, 10);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    // Stop timer on win/loss
    useEffect(() => {
        if (gameState !== 'playing') {
            setIsRunning(false);
        }
    }, [gameState]);

    const handleSubmitScore = async () => {
        if (!user || hasSubmitted) return;

        // Check if username exists
        if (!username) {
            setShowUsernamePrompt(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await submitDailyScore(user.uid, username, level.id.toString(), moves, time);
            setHasSubmitted(true);
            setShowLeaderboard(true);
        } catch (error) {
            console.error('Failed to submit score:', error);
            alert('Failed to submit score. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUsernameSet = async () => {
        setShowUsernamePrompt(false);
        // Retry submission with new username
        await handleSubmitScore();
    };

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

    const memoizedGrid = React.useMemo(() => {
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
                <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ChevronRight className="rotate-180" size={20} />
                    <span className="text-sm font-bold">Back</span>
                </button>

                <div className="flex gap-4 md:gap-6">
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Time
                        </div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatTime(time)}
                        </div>
                    </div>
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
            <div className="relative bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full mb-6 touch-none flex flex-col items-center justify-center min-h-[320px]"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

                <div className={`grid ${gapClass} w-full relative z-0`}
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                        aspectRatio: `${cols}/${rows}`
                    }}>
                    {memoizedGrid}
                </div>

                {/* Win/Loss Overlay */}
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-in fade-in">
                        {gameState === 'won' ? (
                            <>
                                <Trophy size={64} className="text-yellow-500 mb-4" />
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Victory!</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                                    {moves} moves in {formatTime(time)}
                                </p>

                                {hasSubmitted ? (
                                    <button
                                        onClick={() => setShowLeaderboard(true)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                                    >
                                        <Award size={20} />
                                        View Leaderboard
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleSubmitScore}
                                            disabled={isSubmitting}
                                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : (
                                                <>
                                                    <Award size={20} />
                                                    Submit to Leaderboard
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowLeaderboard(true)}
                                            className="w-full text-sm text-slate-500 hover:text-indigo-500 underline"
                                        >
                                            View Leaderboard
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-4">😔</div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Try Again?</h2>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={undo} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-6 rounded-lg">Undo</button>
                                    <button type="button" onClick={reset} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg">Retry</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full justify-center mb-2">
                <button onClick={undo} disabled={!canUndo} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 disabled:opacity-50 transition">
                    <RotateCcw size={20} />
                </button>
                <button onClick={reset} className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition">
                    <RefreshCw size={20} />
                </button>
                <button
                    onClick={() => setShowLeaderboard(true)}
                    className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition"
                >
                    <Award size={20} />
                </button>
            </div>

            {showLeaderboard && (
                <LeaderboardModal
                    levelId={level.id.toString()}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}

            {showUsernamePrompt && (
                <UsernameModal onClose={handleUsernameSet} />
            )}
        </div>
    );
};

export default DailyGameView;