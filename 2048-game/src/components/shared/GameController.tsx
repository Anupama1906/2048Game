// src/components/shared/GameController.tsx
import React, { useEffect, useRef } from 'react';
import type { Level } from '../../types/types';
import { useGame } from '../../hooks/usegame';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { GameBoard } from './GameBoard';

interface GameControllerProps {
    level: Level;
    onBack: () => void;
    // Callbacks for game events
    onWin?: (moves: number) => void;
    onLoss?: () => void;
    onMove?: (moves: number, gameState: string) => void;

    // UI Slots
    headerExtra?: React.ReactNode;
    winOverlay?: React.ReactNode;
    lostOverlay?: React.ReactNode;
    additionalControls?: React.ReactNode;
}

export const GameController: React.FC<GameControllerProps> = ({
    level,
    onBack,
    onWin,
    onLoss,
    onMove,
    headerExtra,
    winOverlay,
    lostOverlay,
    additionalControls
}) => {
    // 1. Initialize Game Logic
    const { grid, gameState, move, undo, reset, canUndo, moves } = useGame(level);

    // 2. Bind Input Controls
    useKeyboardControls(move);
    const touchHandlers = useTouchGestures(move);

    // 3. Handle Game Events
    // We use refs to prevent running effects on every render, only when state changes
    const prevGameState = useRef(gameState);
    const prevMoves = useRef(moves);

    useEffect(() => {
        // Notify parent of moves/state changes
        if (moves !== prevMoves.current || gameState !== prevGameState.current) {
            onMove?.(moves, gameState);
            prevMoves.current = moves;
        }

        // Handle Game Over
        if (gameState !== prevGameState.current) {
            if (gameState === 'won') {
                onWin?.(moves);
            } else if (gameState === 'lost') {
                onLoss?.();
            }
            prevGameState.current = gameState;
        }
    }, [gameState, moves, onWin, onLoss, onMove]);

    // 4. Render Board
    return (
        <GameBoard
            level={level}
            grid={grid}
            gameState={gameState}
            moves={moves}
            onBack={onBack}
            onUndo={undo}
            onReset={reset}
            canUndo={canUndo}
            touchHandlers={touchHandlers}
            headerExtra={headerExtra}
            winOverlay={winOverlay}
            lostOverlay={lostOverlay}
            additionalControls={additionalControls}
        />
    );
};