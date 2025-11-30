import React from 'react';
import { ChevronRight, Star, Check, Lock, Trophy } from 'lucide-react';
import type { Level } from '../types/types';
import { INITIAL_LEVELS } from '../data/levels';

interface LevelSelectViewProps {
    onSelectLevel: (l: Level) => void;
    onBack: () => void;
    bestScores: Record<string | number, number>;
}

const LevelSelectView: React.FC<LevelSelectViewProps> = ({ onSelectLevel, onBack, bestScores }) => {

    // 1. Group levels by section
    const sections: Record<string, Level[]> = {};
    const sectionOrder = new Set<string>();

    INITIAL_LEVELS.forEach(l => {
        const sec = l.section || "Misc";
        sectionOrder.add(sec);
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(l);
    });

    const dynamicSectionList = Array.from(sectionOrder);
    const totalLevels = INITIAL_LEVELS.length;
    const completedCount = Object.keys(bestScores).length;

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-5 sm:px-4 lg:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 pt-3 sm:pt-4 lg:pt-6 sticky top-0 z-10 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-950 dark:to-transparent pb-2 lg:pb-3">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg lg:rounded-xl transition text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base lg:text-lg active:scale-95"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Menu</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-xl lg:rounded-2xl shadow-md dark:shadow-lg">
                    <Trophy size={20} className="text-yellow-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base lg:text-lg">
                        {completedCount} / {totalLevels}
                    </span>
                </div>
            </div>

            {/* Level List */}
            <div className="flex-1 overflow-y-auto pb-6 sm:pb-8 lg:pb-10 custom-scrollbar">
                <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                    {dynamicSectionList.map((sectionName, sectionIndex) => {
                        const levels = sections[sectionName];

                        // Section Colors
                        const sectionColors = [
                            'text-blue-600 dark:text-blue-400',
                            'text-purple-600 dark:text-purple-400',
                            'text-orange-600 dark:text-orange-400',
                            'text-emerald-600 dark:text-emerald-400',
                        ];
                        const colorClass = sectionColors[sectionIndex % sectionColors.length];

                        return (
                            <div key={sectionName} className="space-y-2.5 sm:space-y-3 lg:space-y-2">
                                {/* Section Title */}
                                <div className="flex items-baseline justify-between px-1 sm:px-2 lg:px-3">
                                    <h3 className={`text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wider ${colorClass}`}>{sectionName}</h3>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg">World {sectionIndex + 1}</span>
                                </div>

                                {/* List of Rows */}
                                <div className="flex flex-col gap-2 sm:gap-3 lg:gap-2">
                                    {levels.map((level) => {
                                        const bestMove = bestScores[level.id];
                                        const isCompleted = bestMove !== undefined;
                                        const par = level.par || 999;
                                        const earnedStar = isCompleted && bestMove <= par;
                                        const globalIndex = INITIAL_LEVELS.findIndex(l => l.id === level.id) + 1;

                                        return (
                                            <button
                                                key={level.id}
                                                onClick={() => onSelectLevel(level)}
                                                className={`group w-full flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-2.5 sm:p-3.5 lg:p-4 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95
                                                    ${isCompleted
                                                        ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50'
                                                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/30'
                                                    }`}
                                            >
                                                {/* 1. Level Number */}
                                                <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl lg:rounded-2xl font-black text-base sm:text-lg lg:text-xl transition-transform group-hover:scale-110
                                                    ${isCompleted
                                                        ? 'bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300 shadow-md'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {globalIndex}
                                                </div>

                                                {/* 2. Level Name */}
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className={`font-bold leading-tight text-sm sm:text-base lg:text-lg truncate ${isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {level.name}
                                                    </div>
                                                </div>

                                                {/* 3. Check Icon */}
                                                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center">
                                                    {isCompleted ? (
                                                        <div className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-900/40 dark:to-emerald-800/40 p-1.5 lg:p-2 rounded-full animate-in zoom-in shadow-md">
                                                            <Check size={18} className="text-emerald-700 dark:text-emerald-400" strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-30" />
                                                    )}
                                                </div>

                                                {/* 4. Star Icon */}
                                                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center">
                                                    {earnedStar ? (
                                                        <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-900/40 dark:to-yellow-800/40 p-1.5 lg:p-2 rounded-full animate-in zoom-in delay-75 shadow-md">
                                                            <Star size={18} className="text-yellow-700 dark:text-yellow-400 fill-current" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-20" />
                                                    )}
                                                </div>

                                                {/* 5. Arrow Hint */}
                                                <div className="flex-shrink-0 w-4 lg:w-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hidden sm:block">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelSelectView;
