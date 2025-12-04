// src/components/CommunityLevelsView.tsx
import React, { useState, useEffect } from 'react';
import { Search, Play, History, AlertCircle } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { loadSharedLevel, getRecentlyPlayedLevels, incrementPlayCount, saveRecentlyPlayed } from '../services/sharedLevelsService';
import { ViewHeader } from './shared/ViewHeader';
import { LevelCard } from './shared/LevelCard';

export type CommunityTab = 'code' | 'played';

interface CommunityLevelsViewProps {
    onBack: () => void;
    onPlay: (level: CustomLevel) => void;
    activeTab: CommunityTab;
    onTabChange: (tab: CommunityTab) => void;
}

const CommunityLevelsView: React.FC<CommunityLevelsViewProps> = ({ onBack, onPlay, activeTab, onTabChange }) => {
    const [shareCode, setShareCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [playedLevels, setPlayedLevels] = useState<CustomLevel[]>([]);

    useEffect(() => {
        if (activeTab === 'played') {
            loadPlayedLevels();
        }
    }, [activeTab]);

    const loadPlayedLevels = async () => {
        setLoading(true);
        try {
            const levels = await getRecentlyPlayedLevels();
            setPlayedLevels(levels);
        } catch (err) {
            console.error('Failed to load played levels:', err);
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { id: 'code', label: 'Enter Code', icon: Search },
                    { id: 'played', label: 'Recently Played', icon: History }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id as CommunityTab)}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <tab.icon size={16} className="inline mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
                {activeTab === 'code' && (
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Enter Level Code</h3>
                        <input
                            type="text"
                            value={shareCode}
                            onChange={(e) => { setShareCode(e.target.value.toUpperCase()); setError(''); }}
                            placeholder="ABC123"
                            maxLength={6}
                            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-indigo-500 uppercase outline-none transition mb-4"
                        />
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-2 text-sm items-center">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <button
                            onClick={handleLoadLevel}
                            disabled={loading || shareCode.length !== 6}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition"
                        >
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Play size={20} /> Load & Play</>}
                        </button>
                    </div>
                )}

                {activeTab === 'played' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" /></div>
                        ) : playedLevels.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                <History size={48} className="mb-4 opacity-50" />
                                <p>No history yet.</p>
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
                )}
            </div>
        </div>
    );
};

export default CommunityLevelsView;