// src/components/CommunityLevelsView.tsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Clock, Play, User, Target, AlertCircle } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { loadSharedLevel, getRecentLevels, incrementPlayCount } from '../services/sharedLevelsService';

export type CommunityTab = 'code' | 'recent';

interface CommunityLevelsViewProps {
    onBack: () => void;
    onPlay: (level: CustomLevel) => void;
    activeTab: CommunityTab;
    onTabChange: (tab: CommunityTab) => void;
}

const CommunityLevelsView: React.FC<CommunityLevelsViewProps> = ({ onBack, onPlay, activeTab, onTabChange }) => {
    // State is now managed by parent
    const [shareCode, setShareCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recentLevels, setRecentLevels] = useState<CustomLevel[]>([]);

    useEffect(() => {
        if (activeTab === 'recent') {
            loadRecentLevels();
        }
    }, [activeTab]);

    const loadRecentLevels = async () => {
        setLoading(true);
        try {
            const levels = await getRecentLevels(10);
            setRecentLevels(levels);
        } catch (err) {
            console.error('Failed to load recent levels:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadLevel = async () => {
        if (!shareCode.trim()) {
            setError('Please enter a code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const level = await loadSharedLevel(shareCode);
            
            if (!level) {
                setError('Level not found. Check the code and try again.');
                return;
            }

            // Increment play count
            await incrementPlayCount(shareCode.toUpperCase().trim());
            
            // Play the level
            onPlay(level);
        } catch (err) {
            console.error('Failed to load level:', err);
            setError('Failed to load level. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayLevel = async (level: CustomLevel) => {
        if (level.shareCode) {
            await incrementPlayCount(level.shareCode);
        }
        onPlay(level);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-6 sticky top-0 z-10 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow text-slate-600 dark:text-slate-300 font-bold active:scale-95"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <Search size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                            Community Levels
                        </h2>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                            Play Levels by Others
                        </p>
                    </div>
                </div>

                <div className="w-24" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => onTabChange('code')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition ${
                        activeTab === 'code'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <Search size={16} className="inline mr-2" />
                    Enter Code
                </button>
                <button
                    onClick={() => onTabChange('recent')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition ${
                        activeTab === 'recent'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <Clock size={16} className="inline mr-2" />
                    Recent
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
                {activeTab === 'code' && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                                Enter Level Code
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Enter a 6-character code to play a level shared by another player.
                            </p>

                            <input
                                type="text"
                                value={shareCode}
                                onChange={(e) => {
                                    setShareCode(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                placeholder="ABC123"
                                maxLength={6}
                                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-800 dark:text-white transition uppercase"
                            />

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleLoadLevel}
                                disabled={loading || shareCode.length !== 6}
                                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Play size={20} className="fill-current" />
                                        Load & Play
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'recent' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
                            </div>
                        ) : recentLevels.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                                <Search size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">No levels found</p>
                                <p className="text-sm">Be the first to share a level!</p>
                            </div>
                        ) : (
                            recentLevels.map((level) => (
                                <div
                                    key={level.shareCode || level.id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wider">
                                                {level.shareCode}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                                            <Play size={12} className="fill-current" />
                                            {(level as any).plays || 0}
                                        </div>
                                    </div>

                                    {/* Level Info */}
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 truncate">
                                        {level.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5em] mb-4">
                                        {level.description || 'No description'}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <User size={12} />
                                            {level.createdBy}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Target size={12} />
                                            {level.target}
                                        </div>
                                    </div>

                                    {/* Play Button */}
                                    <button
                                        onClick={() => handlePlayLevel(level)}
                                        className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <Play size={16} className="fill-current" />
                                        Play Level
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityLevelsView;