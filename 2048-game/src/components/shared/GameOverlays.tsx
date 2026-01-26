// src/components/shared/GameOverlays.tsx
import React from 'react';
import { Trophy } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

interface WinOverlayProps {
    moves: number;
    time?: number;
    title?: string; 
    onContinue?: () => void;
    onRetry?: () => void;
    continueLabel?: string;
    additionalContent?: React.ReactNode;
}

export const WinOverlay: React.FC<WinOverlayProps> = ({
    moves,
    time,
    title = 'Solved!', 
    onContinue,
    onRetry,
    continueLabel = 'Next Level',
    additionalContent
}) => {
    return (
        <>
            <Trophy size={64} className="text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">
                {time !== undefined
                    ? `${moves} moves in ${formatTime(time)}`
                    : `in ${moves} moves`}
            </p>
            {additionalContent}
            <div className="flex gap-2">
                {onContinue && (
                    <button
                        onClick={onContinue}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        {continueLabel}
                    </button>
                )}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        Retry
                    </button>
                )}
            </div>
        </>
    );
};

interface LostOverlayProps {
    onUndo: () => void;
    onRetry: () => void;
    additionalContent?: React.ReactNode;
}

export const LostOverlay: React.FC<LostOverlayProps> = ({
    onUndo,
    onRetry,
    additionalContent
}) => {
    return (
        <>
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Try Again?</h2>
            {additionalContent}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={onUndo}
                    className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-6 rounded-lg"
                >
                    Undo
                </button>
                <button
                    onClick={onRetry}
                    className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg"
                >
                    Retry
                </button>
            </div>
        </>
    );
};