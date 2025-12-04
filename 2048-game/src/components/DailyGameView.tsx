// src/components/DailyGameView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Clock, Award, Lock, CheckCircle } from 'lucide-react';
import type { Level } from '../types/types';
import { useGame } from '../hooks/usegame';
import { useAuth } from '../contexts/AuthContext';
import { submitDailyScore, formatTime, hasUserSubmitted } from '../services/leaderboardService';
import LeaderboardModal from './LeaderboardModal';
import UsernameModal from './UsernameModal';

// Shared Components
import { GameBoard } from './shared/GameBoard';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface DailyGameViewProps {
    level: Level;
    onBack: () => void;
}

const DailyGameView: React.FC<DailyGameViewProps> = ({ level, onBack }) => {
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);
    const { user, username } = useAuth();

    // Controls
    useKeyboardControls(move);
    const touchHandlers = useTouchGestures(move);

    // Timer & State
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Submission State
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

    // Check previous submission
    useEffect(() => {
        const checkSubmission = async () => {
            if (user && level.id) {
                const submitted = await hasUserSubmitted(user.uid, level.id.toString());
                setAlreadySubmitted(submitted);
            }
        };
        checkSubmission();
    }, [user, level.id]);

    // Timer Logic
    useEffect(() => {
        if (moves > 0 && !isRunning && gameState === 'playing') setIsRunning(true);
        if (gameState !== 'playing') setIsRunning(false);
    }, [moves, isRunning, gameState]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => setTime(t => t + 0.01), 10);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning]);

    // Submission Logic
    const handleSubmitScore = async () => {
        if (!user || hasSubmitted || alreadySubmitted) return;
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
            console.error(error);
            alert('Failed to submit score.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-submit
    useEffect(() => {
        if (gameState === 'won' && !hasSubmitted && !alreadySubmitted && username && !isSubmitting) {
            handleSubmitScore();
        }
    }, [gameState, hasSubmitted, alreadySubmitted, username]);

    // Custom Win Overlay Content
    const DailyWinContent = () => (
        <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
            {alreadySubmitted ? (
                <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg flex items-center gap-2 justify-center">
                    <Lock size={16} className="text-orange-600 dark:text-orange-400" />
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-bold">Already Submitted</p>
                </div>
            ) : hasSubmitted ? (
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg flex items-center gap-2 justify-center">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-700 dark:text-green-300 font-bold">Score Submitted!</p>
                </div>
            ) : (
                <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Award size={20} /> Submit Score</>}
                </button>
            )}

            <button
                onClick={() => setShowLeaderboard(true)}
                className="w-full text-sm text-slate-500 hover:text-indigo-500 underline"
            >
                View Leaderboard
            </button>
        </div>
    );

    return (
        <>
            <GameBoard
                level={level}
                grid={grid}
                gameState={gameState}
                moves={moves}
                onBack={onBack}
                onMove={move}
                onUndo={undo}
                onReset={reset}
                canUndo={canUndo}
                touchHandlers={touchHandlers}
                headerExtra={
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Time
                        </div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatTime(time)}
                        </div>
                    </div>
                }
                additionalControls={
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition"
                    >
                        <Award size={20} />
                    </button>
                }
                winOverlay={
                    <WinOverlay
                        moves={moves}
                        time={time} // Pass time to overlay
                        additionalContent={<DailyWinContent />}
                    />
                }
                lostOverlay={<LostOverlay onUndo={undo} onRetry={reset} />}
            />

            {showLeaderboard && (
                <LeaderboardModal
                    levelId={level.id.toString()}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}

            {showUsernamePrompt && (
                <UsernameModal onClose={() => { setShowUsernamePrompt(false); handleSubmitScore(); }} />
            )}
        </>
    );
};

export default DailyGameView;