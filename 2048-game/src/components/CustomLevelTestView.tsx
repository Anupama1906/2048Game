// src/components/CustomLevelTestView.tsx
import React, { useEffect, useRef } from 'react';
import { Edit2, CheckCircle } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { useGame } from '../hooks/usegame';
import { saveLevel } from '../services/customLevelsStorage';

// Shared Components
import { GameBoard } from './shared/GameBoard';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface CustomLevelTestViewProps {
    level: CustomLevel;
    onBack: () => void;
    onEdit: () => void;
    onVerified: () => void;
}

const CustomLevelTestView: React.FC<CustomLevelTestViewProps> = ({
    level,
    onBack,
    onEdit,
    onVerified
}) => {
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);
    const hasVerified = useRef(false);

    // Controls
    useKeyboardControls(move);
    const touchHandlers = useTouchGestures(move);

    // Auto-verify on win
    useEffect(() => {
        if (gameState === 'won' && !hasVerified.current && !level.isVerified) {
            hasVerified.current = true;
            const verifiedLevel: CustomLevel = {
                ...level,
                isVerified: true,
                lastModified: new Date().toISOString()
            };
            saveLevel(verifiedLevel);
            console.log('✅ Level verified!');
        }
    }, [gameState, level]);

    const handleBack = () => {
        if (gameState === 'won') onVerified();
        else onBack();
    };

    const VerificationSuccessContent = () => (
        <div className="mt-4 flex flex-col items-center w-full">
            {!level.isVerified && (
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg mb-4">
                    <p className="text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle size={16} />
                        Verified & Saved!
                    </p>
                </div>
            )}
            <div className="flex gap-2">
                <button
                    onClick={handleBack}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition"
                >
                    Back to Menu
                </button>
                <button
                    onClick={onEdit}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-full shadow-lg transition flex items-center gap-2"
                >
                    <Edit2 size={16} /> Edit
                </button>
            </div>
        </div>
    );

    return (
        <GameBoard
            level={level}
            grid={grid}
            gameState={gameState}
            moves={moves}
            onBack={handleBack}
            onMove={move}
            onUndo={undo}
            onReset={reset}
            canUndo={canUndo}
            touchHandlers={touchHandlers}
            headerExtra={
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    {level.isVerified ? (
                        <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Verified</span>
                    ) : (
                        <span>Testing Mode</span>
                    )}
                </div>
            }
            additionalControls={
                <button
                    onClick={onEdit}
                    className="p-3 bg-white dark:bg-slate-800 shadow rounded-xl text-slate-600 dark:text-slate-300 transition"
                    title="Edit Level"
                >
                    <Edit2 size={20} />
                </button>
            }
            winOverlay={
                <WinOverlay
                    moves={moves}
                    title={!level.isVerified ? "Level Verified!" : "Solved!"}
                    additionalContent={<VerificationSuccessContent />}
                />
            }
            lostOverlay={
                <LostOverlay
                    onUndo={undo}
                    onRetry={reset}
                    additionalContent={
                        <button onClick={onEdit} className="mt-4 text-sm text-slate-500 hover:text-indigo-500 underline flex items-center gap-1">
                            <Edit2 size={14} /> Back to Editor
                        </button>
                    }
                />
            }
        />
    );
};

export default CustomLevelTestView;