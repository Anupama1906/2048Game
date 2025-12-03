// src/components/MiniTile.tsx
import React from 'react';
import { TILE_COLORS } from '../constants/theme';

interface MiniTileProps {
    value: number;
    size?: 'sm' | 'md';
}

const MiniTile: React.FC<MiniTileProps> = ({ value, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10 text-xs',
        md: 'w-12 h-12 text-sm'
    };

    const getFontSize = () => {
        const len = Math.abs(value).toString().length;
        if (size === 'sm') {
            return len > 3 ? 'text-[8px]' : 'text-xs';
        }
        return len > 3 ? 'text-[10px]' : 'text-sm';
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-lg ${TILE_COLORS[value] || 'bg-gray-900 text-white'
                } shadow-sm flex items-center justify-center font-bold ${getFontSize()} select-none`}
        >
            {value}
        </div>
    );
};

export default MiniTile;