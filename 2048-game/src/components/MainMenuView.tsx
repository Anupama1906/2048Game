// src/components/MainMenuView.tsx
import React, { useEffect, useState } from 'react';
import { Grid as GridIcon, Moon, Sun, Plus, Calendar, Clock, Sparkles } from 'lucide-react';

interface MainMenuViewProps {
    onPlay: () => void;
    onCreate: () => void;
    onDaily: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    hasPlayedDaily: boolean; // New prop
}

const MainMenuView: React.FC<MainMenuViewProps> = ({
    onPlay,
    onCreate,
    onDaily,
    isDarkMode,
    toggleDarkMode,
    hasPlayedDaily
}) => {
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown Logic
    useEffect(() => {
        if (!hasPlayedDaily) return;

        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // Midnight next day
            const diff = tomorrow.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Ready!");
                return;
            }

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
        };

        const timerId = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        return () => clearInterval(timerId);
    }, [hasPlayedDaily]);

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

            {/* Buttons */}
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
                    className="group relative w-full py-3.5 sm:py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-700 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-[1.02] active:scale-95 duration-200 overflow-hidden"
                >
                    <div className="flex items-center gap-3 text-base sm:text-lg">
                        <Calendar size={24} className="text-orange-500" />
                        <span>Daily Puzzle</span>
                    </div>

                    {/* STATUS INDICATORS */}
                    {!hasPlayedDaily ? (
                        /* NOT PLAYED: New Badge */
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 animate-pulse">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="text-[10px] sm:text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                New
                            </span>
                        </div>
                    ) : (
                        /* PLAYED: Countdown Timer */
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            <Clock size={12} className="text-slate-400" />
                            <span>New puzzle in: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{timeLeft}</span></span>
                        </div>
                    )}
                </button>

                {/* 3. Create Level Button */}
                <button
                    disabled
                    className="w-full py-3.5 sm:py-5 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-base sm:text-lg cursor-not-allowed opacity-60 relative overflow-hidden group transition"
                >
                    <div className="absolute top-2 right-2 bg-slate-200 dark:bg-slate-700 text-[9px] sm:text-[10px] uppercase px-2 py-1 rounded text-slate-500 font-extrabold tracking-wide">
                        Coming Soon
                    </div>
                    <Plus size={24} /> Create Level
                </button>
            </div>

            {/* Footer */}
            <div className="mt-10 sm:mt-12 flex flex-col items-center gap-4">
                <div className="flex gap-4 sm:gap-6 text-slate-300 dark:text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs sm:text-sm font-medium opacity-80">
                    Created by AnupaWicks
                </p>
            </div>
        </div>
    );
};

export default MainMenuView;