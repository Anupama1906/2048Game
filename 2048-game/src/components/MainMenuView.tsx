// MainMenuView.tsx
import React from 'react';
import { Grid as GridIcon, Moon, Sun, Plus } from 'lucide-react';

interface MainMenuViewProps {
    onPlay: () => void;
    onCreate: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const MainMenuView: React.FC<MainMenuViewProps> = ({ onPlay, onCreate, isDarkMode, toggleDarkMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto relative">
            <button
                onClick={toggleDarkMode}
                className="absolute top-0 right-0 p-3 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-yellow-400 transition hover:scale-110"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="mb-12 text-center">
                <h1 className="text-6xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">
                    Target<span className="text-orange-500">2048</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Puzzle Edition</p>
            </div>

            <div className="w-full space-y-4">
                <button
                    onClick={onPlay}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 text-lg transition transform hover:scale-[1.02]"
                >
                    <GridIcon size={24} /> Play Levels
                </button>

                <button
                    onClick={onCreate}
                    className="w-full py-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 text-lg transition transform hover:scale-[1.02]"
                >
                    <Plus size={24} /> Create Level
                </button>
            </div>

            <div className="mt-12 flex gap-6 text-slate-400 dark:text-slate-600">
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
            </div>
        </div>
    );
};

export default MainMenuView;