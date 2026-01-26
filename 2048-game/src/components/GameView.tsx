// src/components/GameView.tsx
import React from 'react';
import type { Level } from '../types/types';
import { WinOverlay, LostOverlay } from './shared/GameOverlays';
import { GameController } from './shared/GameController';

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
    const [moves, setMoves] = React.useState(0);

    return (
        <GameController
            level={level}
            onBack={onBack}
            onMove={(currentMoves) => setMoves(currentMoves)}
            onWin={onLevelWon} // Handled automatically by controller now

            headerExtra={
                <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Best</div>
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {bestScore !== undefined ? bestScore : '-'}
                    </div>
                </div>
            }

            winOverlay={<WinOverlay moves={moves} onContinue={onComplete} />}

            lostOverlay={<LostOverlay onUndo={() => { }} onRetry={() => { }} />}
        />
    );
};

export default GameView;