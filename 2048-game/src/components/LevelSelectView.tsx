// LevelSelectView.tsx
import React from 'react';
import { ChevronRight, Lock, Star } from 'lucide-react';
import type { Level } from '../types/types';
import { INITIAL_LEVELS } from '../constants/constants';

interface LevelSelectViewProps {
    onSelectLevel: (l: Level) => void;
    onBack: () => void;
    completedLevels?: Set<number | string>; // Optional: track completed levels
}

const LevelSelectView: React.FC<LevelSelectViewProps> = ({ onSelectLevel, onBack, completedLevels = new Set() }) => {
    // Group levels by section
    const sections: Record<string, Level[]> = {};
    INITIAL_LEVELS.forEach(l => {
        const sec = l.section || "Misc";
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(l);
    });

    const sectionOrder = ["Basics", "Strategies", "Challenges", "Expert", "Misc"];
    const orderedSections = sectionOrder.filter(s => sections[s]);

    return (
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pt-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span className="font-semibold">Menu</span>
                </button>
                <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Progress</div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {completedLevels.size}/{INITIAL_LEVELS.length}
                    </div>
                </div>
            </div>

            {/* Level Grid */}
            <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
                <div className="space-y-10">
                    {orderedSections.map((sectionName, sectionIndex) => {
                        const levels = sections[sectionName];
                        const sectionColors = [
                            'from-blue-500 to-indigo-600',
                            'from-purple-500 to-pink-600',
                            'from-orange-500 to-red-600',
                            'from-emerald-500 to-teal-600'
                        ];
                        const gradientClass = sectionColors[sectionIndex % sectionColors.length];

                        return (
                            <div key={sectionName} className="space-y-4">
                                {/* Section Header */}
                                <div className={`bg-gradient-to-r ${gradientClass} rounded-2xl p-6 shadow-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                                                World {sectionIndex + 1}
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">{sectionName}</h3>
                                        </div>
                                        <div className="text-white/90 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                                            {levels.filter(l => completedLevels.has(l.id)).length}/{levels.length}
                                        </div>
                                    </div>
                                </div>

                                {/* Level Cards */}
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {levels.map((level, index) => {
                                        const isCompleted = completedLevels.has(level.id);
                                        const levelNumber = index + 1;

                                        return (
                                            <button
                                                key={level.id}
                                                onClick={() => onSelectLevel(level)}
                                                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 overflow-hidden aspect-square"
                                            >
                                                {/* Completed Badge */}
                                                {isCompleted && (
                                                    <div className="absolute top-2 right-2 z-10">
                                                        <div className="bg-yellow-400 rounded-full p-1 shadow-lg">
                                                            <Star size={14} className="text-yellow-900 fill-yellow-900" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex flex-col items-center justify-center h-full p-4">
                                                    {/* Level Number */}
                                                    <div className="text-4xl font-black text-slate-800 dark:text-slate-200 mb-2 group-hover:scale-110 transition-transform">
                                                        {levelNumber}
                                                    </div>

                                                    {/* Target Badge */}
                                                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                        {level.target}
                                                    </div>

                                                    {/* Level Name (on hover) */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-white text-xs font-semibold text-center line-clamp-2">
                                                            {level.name}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hover Effect Overlay */}
                                                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
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