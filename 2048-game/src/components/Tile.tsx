import React, { memo } from 'react';
import { Lock, Factory, Magnet } from 'lucide-react';
import type { Cell } from '../types/types';
import { TILE_COLORS } from '../constants/theme';
import { WALL } from '../constants/game';

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
            <div className="w-full h-full rounded-lg bg-slate-700 shadow-inner flex items-center justify-center border-4 border-slate-800 dark:border-slate-900">
                <Lock className="text-slate-500 w-6 h-6" />
            </div>
        );
    }

    let displayValue: number;
    let isLocked = false;
    let isGenerator = false;
    let isSticky = false;

    if (typeof value === 'object') {
        displayValue = value.value;
        if (value.type === 'locked') isLocked = true;
        if (value.type === 'generator') isGenerator = true;
        if (value.type === 'sticky') isSticky = true;
    } else {
        displayValue = value;
    }

    const getFontSize = (val: number) => {
        const len = val.toString().length;
        if (boardSize <= 3) return len > 3 ? 'text-4xl' : 'text-5xl';
        if (boardSize === 4) return len > 3 ? 'text-3xl' : 'text-4xl';
        if (boardSize === 5) return len > 3 ? 'text-xl' : 'text-2xl';
        return len > 3 ? 'text-xs' : 'text-sm';
    };

    const fontSizeClass = getFontSize(displayValue);

    let extraStyle = "";
    if (isLocked) {
        extraStyle = "border-4 border-slate-400 dark:border-slate-500 ring-2 ring-slate-200 dark:ring-slate-700 z-10";
    } else if (isGenerator) {
        extraStyle = "border-4 border-dashed border-slate-600 dark:border-slate-400 z-10";
    } else if (isSticky) {
        extraStyle = "border-4 border-red-400 dark:border-red-500 z-10";
    }

    if (isSticky && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-red-100/50 dark:bg-red-900/30 border-4 border-red-300 dark:border-red-700 border-dashed flex items-center justify-center">
                <Magnet className="text-red-400 dark:text-red-500 opacity-50" size={24} />
            </div>
        );
    }

    return (
        <div className={`w-full h-full rounded-lg ${TILE_COLORS[displayValue] || 'bg-gray-900 text-white'} ${extraStyle} shadow-sm flex items-center justify-center font-bold ${fontSizeClass} select-none animate-in zoom-in duration-200 relative overflow-hidden`}>
            {displayValue}
            {isLocked && (
                <div className="absolute top-1 right-1 opacity-60">
                    <Lock size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
            {isGenerator && (
                <div className="absolute top-1 right-1 opacity-60">
                    <Factory size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
            {isSticky && (
                <div className="absolute top-1 right-1 opacity-60">
                    <Magnet size={14} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
        </div>
    );
};


export default memo(Tile);