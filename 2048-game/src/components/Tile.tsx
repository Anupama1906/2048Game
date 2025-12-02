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
            <div className="w-full h-full rounded-lg bg-slate-700 shadow-inner flex items-center justify-center border-4 border-slate-800 dark:border-slate-900">
                <Lock className="text-slate-500 w-6 h-6" />
            </div>
        );
    }

    // 3. Handle Special Objects (Temporary, Locked, Sticky, etc.)
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

    // 4. Special Case: Empty Temporary Cell (Floor with Counter)
    if (isTemporary && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-amber-100/50 dark:bg-amber-900/30 border-4 border-amber-300 dark:border-amber-700 border-dashed flex flex-col items-center justify-center gap-1">
                <Hourglass className="text-amber-500 dark:text-amber-500 opacity-60" size={boardSize > 5 ? 16 : 24} />
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">{tempLimit}</span>
            </div>
        );
    }

    // 5. Render Occupied Tile
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
    } else if (isTemporary) {
        extraStyle = "border-4 border-dashed border-amber-400 dark:border-amber-600 z-10";
    }

    // Special Case: Empty Sticky Cell
    if (isSticky && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-red-100/50 dark:bg-red-900/30 border-4 border-red-300 dark:border-red-700 border-dashed flex items-center justify-center">
                <Magnet className="text-red-400 dark:text-red-500 opacity-50" size={24} />
            </div>
        );
    }

    // Special Case: Empty Locked Cell (The "Trap")
    if (isLocked && displayValue === 0) {
        return (
            <div className="w-full h-full rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border-4 border-slate-300 dark:border-slate-600 border-dashed flex items-center justify-center">
                <Lock className="text-slate-400 dark:text-slate-500 opacity-50" size={24} />
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
            {isTemporary && (
                <div className="absolute top-1 right-1 opacity-80 flex items-center gap-0.5 bg-black/10 rounded px-1">
                    <Hourglass size={10} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    <span className="text-[9px] leading-none text-slate-900 dark:text-white">{tempLimit}</span>
                </div>
            )}
        </div>
    );
};


export default memo(Tile);