// src/components/Tile.tsx
import React, { memo } from 'react';
import { Lock } from 'lucide-react';
import type { Cell } from '../types/types';
import { WALL } from '../constants/game';
import { NumberTile } from './tiles/NumberTile';
import { SpecialTile } from './tiles/SpecialTile';

interface TileProps {
    value: Cell;
    boardSize: number;
}

const Tile: React.FC<TileProps> = ({ value, boardSize }) => {

    if (value === 0) {
        return <div className="w-full h-full rounded-lg bg-gray-200/50 dark:bg-gray-700/50" />;
    }


    if (value === WALL) {
        return (
            <div className="w-full h-full rounded-lg bg-slate-700 dark:bg-slate-600 shadow-inner flex items-center justify-center border-4 border-slate-800 dark:border-slate-500">
                <Lock className="text-slate-500 dark:text-slate-300 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
        );
    }

    if (typeof value === 'object') {
        return (
            <SpecialTile
                type={value.type}
                value={value.value}
                boardSize={boardSize}
                limit={'limit' in value ? value.limit : undefined}
            />
        );
    }
    return <NumberTile value={value} boardSize={boardSize} />;
};

export default memo(Tile);