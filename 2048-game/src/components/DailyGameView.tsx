import React, { useEffect, useState } from 'react';
import { Clock, Award, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Level } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { submitDailyScore, formatTime, hasUserSubmitted } from '../services/leaderboardService';
import LeaderboardModal from './LeaderboardModal';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { GameController } from './shared/GameController'; // Updated Import
import { useDailyTimer } from '../hooks/useDailyTimer'; // Updated Import

interface DailyGameViewProps {
    level: Level;
    onBack: () => void;
}

const DailyGameView: React.FC<DailyGameViewProps> = ({ level, onBack }) => {
    // 1. Context & State
    const { user, username } = useAuth();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // 2. Custom Hooks
    // Extracted logic handles timer & persistence automatically
    const { time, setIsRunning, clearStorage } = useDailyTimer(level.id, user?.uid || null);

    // 3. Check previous submissions on load
    useEffect(() => {
        if (user) {
            hasUserSubmitted(user.uid, level.id.toString()).then(setAlreadySubmitted);
        }
    }, [user, level.id]);

    // 4. Event Handlers
    const handleGameMove = (moves: number, gameState: string) => {
        // Start timer on first move
        if (moves > 0 && gameState === 'playing') setIsRunning(true);
        // Stop timer if game ends (redundant but safe)
        if (gameState !== 'playing') setIsRunning(false);
    };

    const handleWin = async (moves: number) => {
        setIsRunning(false); // Stop timer immediately

        if (!user || hasSubmitted || alreadySubmitted || !username) return;

        try {
            await submitDailyScore(user.uid, username, level.id.toString(), moves, time);
            setHasSubmitted(true);
            setShowLeaderboard(true);
            clearStorage(); // Reset local progress on success
        } catch (error) {
            console.error('Submission failed', error);
        }
    };

    // 5. Render
    return (
        <>
            <GameController
                level={level}
                onBack={onBack}
                onMove={handleGameMove}
                onWin={handleWin}
                onLoss={() => setIsRunning(false)}

                // Custom Header Content
                headerExtra={
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Time
                        </div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatTime(time)}
                        </div>
                    </div>
                }

                // Custom Controls
                additionalControls={
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                        title="Leaderboard"
                    >
                        <Award size={20} />
                    </button>
                }

                // Custom Win Overlay
                winOverlay={
                    <WinOverlay
                        moves={0} // Passed as 0, GameController handles standard display, but we are customizing content anyway
                        title={alreadySubmitted ? "Good Job!" : "Puzzle Solved!"}
                        additionalContent={
                            <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
                                {alreadySubmitted ? (
                                    <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg flex items-center gap-2 justify-center">
                                        <Lock size={16} className="text-orange-600 dark:text-orange-400" />
                                        <p className="text-sm text-orange-700 dark:text-orange-300 font-bold">
                                            1st Attempt Recorded
                                        </p>
                                    </div>
                                ) : hasSubmitted ? (
                                    <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg flex items-center gap-2 justify-center">
                                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                        <p className="text-sm text-green-700 dark:text-green-300 font-bold">
                                            Score Submitted!
                                        </p>
                                    </div>
                                ) : null}

                                <button
                                    onClick={() => setShowLeaderboard(true)}
                                    className="w-full text-sm text-slate-500 hover:text-indigo-500 underline"
                                >
                                    View Leaderboard
                                </button>
                            </div>
                        }
                    />
                }

                // Custom Lost Overlay
                lostOverlay={
                    <LostOverlay
                        onUndo={() => { }} // No-op, GameController wires these automatically
                        onRetry={() => { }}
                        additionalContent={
                            !alreadySubmitted && (
                                <p className="text-xs text-orange-500 flex items-center gap-1 mt-2">
                                    <AlertTriangle size={12} /> Timer continues on retry!
                                </p>
                            )
                        }
                    />
                }
            />

            {showLeaderboard && (
                <LeaderboardModal
                    levelId={level.id.toString()}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}
        </>
    );
};

export default DailyGameView;