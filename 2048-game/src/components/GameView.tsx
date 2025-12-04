import React, { useEffect, useRef } from 'react';
import type { Level } from '../types/types';
import { useGame } from '../hooks/usegame';
import { GameBoard } from './shared/GameBoard';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface GameViewProps {
    level: Level;
    bestScore?: number;
    onBack: () => void;
    onLevelWon: (moves: number) => void;
    onComplete: () => void;
}

const GameView: React.FC<GameViewProps> = ({
    level,
    bestScore,
    onBack,
    onLevelWon,
    onComplete
}) => {
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);
    const hasSavedScore = useRef(false);

    // Use custom hooks
    useKeyboardControls(move);
    const touchHandlers = useTouchGestures(move);

    // Auto-save score on win
    useEffect(() => {
        if (gameState === 'playing') {
            hasSavedScore.current = false;
        } else if (gameState === 'won' && !hasSavedScore.current) {
            onLevelWon(moves);
            hasSavedScore.current = true;
        }
    }, [gameState, moves, onLevelWon]);

    return (
        <GameBoard
            level={level}
            grid={grid}
            gameState={gameState}
            moves={moves}
            onBack={() => onBack()}
            onMove={move}
            onUndo={undo}
            onReset={reset}
            canUndo={canUndo}
            headerExtra={
                <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Best</div>
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {bestScore !== undefined ? bestScore : '-'}
                    </div>
                </div>
            }
            winOverlay={<WinOverlay moves={moves} onContinue={onComplete} />}
            lostOverlay={<LostOverlay onUndo={undo} onRetry={reset} />}
        />
    );
};

export default GameView;