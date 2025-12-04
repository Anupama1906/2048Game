// src/components/Tile.tsx
import React, { memo } from 'react';
import { Lock, Factory, Magnet, Hourglass } from 'lucide-react';
import type { Cell } from '../types/types';
import { TILE_COLORS } from '../constants/theme';
import { WALL } from '../constants/game';

interface TileProps {
    value: Cell;
    boardSize: number;
}

const Tile: React.FC<TileProps> = ({ value, boardSize }) => {
    // 1. Handle Empty/Floor Cases
    if (value === 0) {
        return <div className="w-full h-full rounded-lg bg-gray-200/50 dark:bg-gray-700/50" />;
    }

    // 2. Handle Wall
    if (value === WALL) {
        return (
            <div className="w-full h-full rounded-lg bg-slate-700 dark:bg-slate-600 shadow-inner flex items-center justify-center border-4 border-slate-800 dark:border-slate-500">
                <Lock className="text-slate-500 dark:text-slate-300 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
        );
    }

    // 3. Handle Special Objects
    let displayValue: number;
    let isLocked = false;
    let isGenerator = false;
    let isSticky = false;
    let isTemporary = false;
    let tempLimit = 0;

    if (typeof value === 'object') {
        displayValue = value.value;
        if (value.type === 'locked') isLocked = true;
        if (value.type === 'generator') isGenerator = true;
        if (value.type === 'sticky') isSticky = true;
        if (value.type === 'temporary') {
            isTemporary = true;
            tempLimit = value.limit;
        }
    } else {
        displayValue = value;
    }

    // 4. Special Case: Empty Temporary Cell
    if (isTemporary && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-amber-100/50 dark:bg-amber-900/40 border-4 border-amber-300 dark:border-amber-600 border-dashed flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                <Hourglass className="text-amber-500 dark:text-amber-300 opacity-70" size={boardSize > 5 ? 12 : 20} />
                <span className="text-amber-600 dark:text-amber-300 font-bold text-[10px] sm:text-xs">{tempLimit}</span>
            </div>
        );
    }

    // 5. Dynamic Font Size Calculation
    // Uses responsive classes (default for mobile, sm: for tablet/desktop)
    const getFontSize = (val: number) => {
        const len = val.toString().length;

        // 3x3 Grid (Large tiles)
        if (boardSize <= 3) {
            return len > 3
                ? 'text-2xl sm:text-4xl'
                : 'text-4xl sm:text-5xl';
        }

        // 4x4 Grid (Standard)
        if (boardSize === 4) {
            return len > 3
                ? 'text-lg sm:text-3xl'
                : 'text-2xl sm:text-4xl';
        }

        // 5x5 Grid (Dense)
        if (boardSize === 5) {
            return len > 3
                ? 'text-xs sm:text-xl'
                : 'text-lg sm:text-3xl';
        }

        // 6x6+ Grid (Very dense)
        return len > 3
            ? 'text-[10px] sm:text-xs'
            : 'text-xs sm:text-lg';
    };

    const fontSizeClass = getFontSize(displayValue);

    // Border styles
    let extraStyle = "";
    const borderSize = "border-2 sm:border-4"; // thinner borders on mobile

    if (isLocked) {
        extraStyle = `${borderSize} border-slate-400 dark:border-slate-500 ring-1 sm:ring-2 ring-slate-200 dark:ring-slate-700 z-10`;
    } else if (isGenerator) {
        extraStyle = `${borderSize} border-dashed border-slate-600 dark:border-slate-400 z-10`;
    } else if (isSticky) {
        extraStyle = `${borderSize} border-red-400 dark:border-red-500 z-10`;
    } else if (isTemporary) {
        extraStyle = `${borderSize} border-dashed border-amber-400 dark:border-amber-600 z-10`;
    }

    // Special Case: Empty Sticky Cell
    if (isSticky && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-red-100/50 dark:bg-red-900/40 border-2 sm:border-4 border-red-300 dark:border-red-600 border-dashed flex items-center justify-center">
                <Magnet className="text-red-500 dark:text-red-400 opacity-70" size={boardSize > 5 ? 16 : 24} />
            </div>
        );
    }

    // Special Case: Empty Locked Cell
    if (isLocked && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border-2 sm:border-4 border-slate-300 dark:border-slate-500 border-dashed flex items-center justify-center">
                <Lock className="text-slate-400 dark:text-slate-400 opacity-70" size={boardSize > 5 ? 16 : 24} />
            </div>
        );
    }

    // Icon size helper
    const iconSize = boardSize > 5 ? 10 : 14;

    return (
        <div className={`w-full h-full rounded-lg ${TILE_COLORS[displayValue] || 'bg-gray-900 text-white'} ${extraStyle} shadow-sm flex items-center justify-center font-bold ${fontSizeClass} select-none animate-in zoom-in duration-200 relative overflow-hidden`}>
            {displayValue}

            {/* Status Icons - Absolute positioned */}
            {isLocked && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-60">
                    <Lock size={iconSize} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
            {isGenerator && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-60">
                    <Factory size={iconSize} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
            {isSticky && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-60">
                    <Magnet size={iconSize} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}
            {isTemporary && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-90 flex items-center gap-0.5 bg-black/20 dark:bg-white/20 rounded px-1">
                    <Hourglass size={Math.max(8, iconSize - 4)} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    <span className="text-[8px] sm:text-[9px] leading-none text-slate-900 dark:text-white">{tempLimit}</span>
                </div>
            )}
        </div>
    );
};

export default memo(Tile);