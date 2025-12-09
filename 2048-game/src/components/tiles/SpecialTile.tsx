// src/components/tiles/SpecialTile.tsx
import React from 'react';
import { Lock, Factory, Magnet, Hourglass } from 'lucide-react';
import { NumberTile } from './NumberTile';

const ICONS = {
    locked: Lock,
    generator: Factory,
    sticky: Magnet,
    temporary: Hourglass
};

const BORDERS = {
    locked: "border-slate-400 dark:border-slate-500 ring-1 sm:ring-2 ring-slate-200 dark:ring-slate-700",
    generator: "border-dashed border-slate-600 dark:border-slate-400",
    sticky: "border-red-400 dark:border-red-500",
    temporary: "border-dashed border-amber-400 dark:border-amber-600"
};

const EMPTY_BG = {
    locked: "bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-500",
    sticky: "bg-red-100/50 dark:bg-red-900/40 border-red-300 dark:border-red-600",
    temporary: "bg-amber-100/50 dark:bg-amber-900/40 border-amber-300 dark:border-amber-600",
    generator: ""
};

const EMPTY_ICON_COLOR = {
    locked: "text-slate-400 dark:text-slate-400",
    sticky: "text-red-500 dark:text-red-400",
    temporary: "text-amber-500 dark:text-amber-300",
    generator: "text-slate-500"
};

interface SpecialTileProps {
    type: 'locked' | 'generator' | 'sticky' | 'temporary';
    value: number;
    boardSize: number;
    limit?: number;
}

export const SpecialTile: React.FC<SpecialTileProps> = ({ type, value, boardSize, limit }) => {
    const Icon = ICONS[type];
    const borderClass = BORDERS[type];
    const borderSize = "border-2 sm:border-4";
    const iconSize = boardSize > 5 ? 10 : 14;

    // 1. Handle Empty Special State (e.g. Empty Sticky Tile)
    if (value === 0) {
        const bgClass = EMPTY_BG[type];
        const iconColor = EMPTY_ICON_COLOR[type];
        const emptyIconSize = boardSize > 5 ? 12 : 20;

        return (
            <div className={`w-full h-full rounded-lg ${bgClass} ${borderSize} border-dashed flex flex-col items-center justify-center gap-0.5 sm:gap-1`}>
                <Icon className={`${iconColor} opacity-70`} size={emptyIconSize} />
                {type === 'temporary' && limit && (
                    <span className="text-amber-600 dark:text-amber-300 font-bold text-[10px] sm:text-xs">{limit}</span>
                )}
            </div>
        );
    }

    // 2. Render Active Special Tile
    return (
        <NumberTile
            value={value}
            boardSize={boardSize}
            extraClasses={`${borderSize} ${borderClass} z-10`}
        >
            {/* Standard Overlay Icon: Only render if NOT temporary (prevents overlap) */}
            {type !== 'temporary' && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-60">
                    <Icon size={iconSize} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                </div>
            )}

            {/* Special Badge for Temporary tiles (includes icon + limit) */}
            {type === 'temporary' && limit !== undefined && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-90 flex items-center gap-0.5 bg-black/20 dark:bg-white/20 rounded px-1">
                    <Icon size={Math.max(8, iconSize - 4)} className="text-slate-900 dark:text-white" strokeWidth={2.5} />
                    <span className="text-[8px] sm:text-[9px] leading-none text-slate-900 dark:text-white">{limit}</span>
                </div>
            )}
        </NumberTile>
    );
};