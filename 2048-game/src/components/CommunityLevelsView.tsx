// src/components/CommunityLevelsView.tsx
import React, { useState, useEffect } from 'react';
import { Search, Play, History, AlertCircle, Hash } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { loadSharedLevel, getRecentlyPlayedLevels, incrementPlayCount, saveRecentlyPlayed } from '../services/sharedLevelsService';
import { ViewHeader } from './shared/ViewHeader';
import { LevelCard } from './shared/LevelCard';

interface CommunityLevelsViewProps {
    onBack: () => void;
    onPlay: (level: CustomLevel) => void;
}

const CommunityLevelsView: React.FC<CommunityLevelsViewProps> = ({ onBack, onPlay }) => {
    const [shareCode, setShareCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false); // Separate loading state for history
    const [error, setError] = useState('');
    const [playedLevels, setPlayedLevels] = useState<CustomLevel[]>([]);

    // Load history immediately on mount
    useEffect(() => {
        loadPlayedLevels();
    }, []);

    const loadPlayedLevels = async () => {
        setLoadingHistory(true);
        try {
            const levels = await getRecentlyPlayedLevels();
            setPlayedLevels(levels);
        } catch (err) {
            console.error('Failed to load played levels:', err);
        } finally {
            setLoadingHistory(false);
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
                setError('Level not found.');
                return;
            }
            handlePlayLevel(level);
        } catch (err) {
            setError('Failed to load level.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayLevel = async (level: CustomLevel) => {
        if (level.shareCode) {
            await incrementPlayCount(level.shareCode);
            saveRecentlyPlayed(level);
        }
        onPlay(level);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <ViewHeader
                onBack={onBack}
                title="Community"
                subtitle="Play & Discover"
                icon={Search}
                iconColor="text-indigo-600 dark:text-indigo-400"
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">

                {/* Section 1: Enter Code */}
                <div className="mb-10">
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Hash size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold">Play by Code</h3>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareCode}
                                onChange={(e) => { setShareCode(e.target.value.toUpperCase()); setError(''); }}
                                placeholder="ABC123"
                                maxLength={6}
                                className="flex-1 px-4 py-3 text-center text-lg font-bold tracking-widest bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-indigo-500 uppercase outline-none transition"
                            />
                            <button
                                onClick={handleLoadLevel}
                                disabled={loading || shareCode.length !== 6}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition"
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Play size={24} />}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-2 text-sm items-center animate-in slide-in-from-top-1">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Recently Played */}
                <div>
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <History size={20} className="text-slate-400" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Recently Played</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingHistory ? (
                            <div className="col-span-full flex items-center justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent" />
                            </div>
                        ) : playedLevels.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <History size={40} className="mb-3 opacity-30" />
                                <p className="font-medium">No history yet</p>
                                <p className="text-sm opacity-70">Levels you play via code will appear here</p>
                            </div>
                        ) : (
                            playedLevels.map((level) => (
                                <LevelCard
                                    key={level.shareCode || level.id}
                                    level={level}
                                    variant="community"
                                    onPlay={handlePlayLevel}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityLevelsView;