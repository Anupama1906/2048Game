// src/components/tiles/NumberTile.tsx
import React from 'react';
import { TILE_COLORS } from '../../constants/theme';

export interface NumberTileProps {
    value: number;
    boardSize: number;
    extraClasses?: string;
    children?: React.ReactNode;
}

export const NumberTile: React.FC<NumberTileProps> = ({
    value,
    boardSize,
    extraClasses = '',
    children
}) => {
    // Logic extracted from original Tile.tsx
    const getFontSize = (val: number) => {
        const len = Math.abs(val).toString().length;

        if (boardSize <= 3) {
            return len > 3 ? 'text-2xl sm:text-4xl' : 'text-4xl sm:text-5xl';
        }
        if (boardSize === 4) {
            return len > 3 ? 'text-lg sm:text-3xl' : 'text-2xl sm:text-4xl';
        }
        if (boardSize === 5) {
            return len > 3 ? 'text-xs sm:text-xl' : 'text-lg sm:text-3xl';
        }
        return len > 3 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-lg';
    };

    const fontSizeClass = getFontSize(value);
    const colorClass = TILE_COLORS[value] || 'bg-gray-900 text-white';

    return (
        <div
            className={`
                w-full h-full rounded-lg shadow-sm flex items-center justify-center font-bold select-none animate-in zoom-in duration-200 relative overflow-hidden
                ${colorClass} 
                ${fontSizeClass} 
                ${extraClasses}
            `}
        >
            {value}
            {children}
        </div>
    );
};