// src/components/CustomLevelTestView.tsx
import React, { useState, useRef } from 'react';
import { Edit2, CheckCircle, Share2, Copy, Check } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { saveLevel } from '../services/customLevelsStorage';
import { shareLevel } from '../services/sharedLevelsService';
import { useAuth } from '../contexts/AuthContext';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { GameController } from './shared/GameController';

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
    const { username } = useAuth();
    const [isWon, setIsWon] = useState(false);
    const hasVerified = useRef(false);

    // Sharing State
    const [shareCode, setShareCode] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleWin = (moves: number) => {
        setIsWon(true);

        if (!hasVerified.current && !level.isVerified) {
            hasVerified.current = true;
            const verifiedLevel: CustomLevel = {
                ...level,
                isVerified: true,
                lastModified: new Date().toISOString()
            };
            saveLevel(verifiedLevel);
            console.log('✅ Level verified!');
        }
    };

    const handleBack = () => {
        if (isWon) onVerified();
        else onBack();
    };

    const handleShare = async () => {
        if (!username) return;
        setIsSharing(true);
        try {
            // Ensure we share the verified version
            const levelToShare = { ...level, isVerified: true };
            const code = await shareLevel(levelToShare, username);
            setShareCode(code);
        } catch (e) {
            alert('Failed to share level. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyCode = () => {
        if (shareCode) {
            navigator.clipboard.writeText(shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Component for the Success Overlay
    const VerificationSuccessContent = () => (
        <div className="mt-4 flex flex-col items-center w-full max-w-sm">
            {!level.isVerified && !shareCode && (
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg mb-4">
                    <p className="text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle size={16} />
                        Verified & Saved!
                    </p>
                </div>
            )}

            {shareCode ? (
                <div className="mb-4 w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in zoom-in">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-bold text-center">Level Shared Code</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-lg flex items-center justify-center font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {shareCode}
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="mb-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    {isSharing ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <Share2 size={18} /> Share Level
                        </>
                    )}
                </button>
            )}

            <div className="flex gap-2 w-full">
                <button
                    onClick={handleBack}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 rounded-xl shadow-sm transition"
                >
                    Back to Menu
                </button>
                <button
                    onClick={onEdit}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl shadow-sm transition flex justify-center items-center gap-2 border border-slate-200 dark:border-slate-600"
                >
                    <Edit2 size={16} /> Edit
                </button>
            </div>
        </div>
    );

    return (
        <GameController
            level={level}
            onBack={handleBack}
            onWin={handleWin}
            onMove={(_, gameState) => {
                if (gameState === 'won') setIsWon(true);
            }}

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
                    moves={0}
                    title={!level.isVerified ? "Level Verified!" : "Solved!"}
                    additionalContent={<VerificationSuccessContent />}
                />
            }

            lostOverlay={
                <LostOverlay
                    onUndo={() => { }}
                    onRetry={() => { }}
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