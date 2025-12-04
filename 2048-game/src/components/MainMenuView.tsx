// src/components/MainMenuView.tsx
import React from 'react';
import { Grid as GridIcon, Moon, Sun, Plus, Calendar, Users } from 'lucide-react';

interface MainMenuViewProps {
    onPlay: () => void;
    onCreate: () => void;
    onDaily: () => void;
    onCommunity: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const MainMenuView: React.FC<MainMenuViewProps> = ({ onPlay, onCreate, onDaily, onCommunity, isDarkMode, toggleDarkMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-6 sm:px-6 lg:px-8 relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleDarkMode}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 p-2.5 sm:p-3 lg:p-3.5 bg-white dark:bg-slate-800 rounded-full text-slate-600 dark:text-yellow-400 transition hover:scale-110 shadow-md dark:shadow-lg hover:shadow-lg active:scale-95"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Title */}
            <div className="mb-8 sm:mb-12 lg:mb-16 text-center max-w-2xl">
                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-slate-800 dark:text-white mb-2 sm:mb-3 tracking-tighter leading-tight">
                    Target<span className="text-orange-500">2048</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 font-medium">Puzzle Edition</p>
            </div>

            <div className="w-full max-w-md space-y-3 sm:space-y-4 lg:max-w-lg">
                {/* 1. Play Levels Button */}
                <button
                    onClick={onPlay}
                    className="w-full py-3.5 sm:py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-bold shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900/30 flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                    <GridIcon size={24} /> Play Levels
                </button>

                {/* 2. Daily Puzzle Button */}
                <button
                    onClick={onDaily}
                    className="w-full py-3.5 sm:py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-700 shadow-sm hover:shadow-md flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                    <Calendar size={24} className="text-orange-500" /> Daily Puzzle
                </button>

                {/* 3. Community Levels Button */}
                <button
                    onClick={onCommunity}
                    className="w-full py-3.5 sm:py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold border-2 border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-700 shadow-sm hover:shadow-md flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                    <Users size={24} className="text-indigo-500" /> Community Levels
                </button>

                {/* 4. Create Level Button */}
                <button
                    onClick={onCreate}
                    className="w-full py-3.5 sm:py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold border-2 border-purple-200 dark:border-purple-900/50 hover:border-purple-400 dark:hover:border-purple-700 shadow-sm hover:shadow-md flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                    <Plus size={24} className="text-purple-500" /> My Levels
                </button>
            </div>

            {/* Footer dots */}
            <div className="mt-10 sm:mt-12 flex gap-4 sm:gap-6 text-slate-300 dark:text-slate-700">
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
            </div>
        </div>
    );
};

export default MainMenuView;