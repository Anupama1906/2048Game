// src/components/DevPanel.tsx
import React, { useState } from 'react';
import { Settings, Calendar, Zap, List, X, CheckCircle, Trash2 } from 'lucide-react';
import type { Level } from '../types/types';
import type { CustomLevel } from '../types/editorTypes';
import { INITIAL_LEVELS } from '../data/levels';
import { DAILY_LEVELS } from '../data/dailyLevels';
import { getDailyLevel } from '../utils/daily';
import { saveLevel } from '../services/customLevelsStorage';

interface DevPanelProps {
    onJumpToLevel: (level: Level) => void;
    onPlayDaily: (date: string) => void;
    currentLevel?: Level | CustomLevel | null;
    onVerifyLevel?: () => void;
}

const DevPanel: React.FC<DevPanelProps> = ({
    onJumpToLevel,
    onPlayDaily,
    currentLevel,
    onVerifyLevel
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'daily' | 'levels' | 'quick'>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Jump to specific level
    const handleLevelJump = (levelId: string) => {
        const level = INITIAL_LEVELS.find(l => l.id === levelId);
        if (level) {
            onJumpToLevel(level);
            setIsOpen(false);
        }
    };

    // Play daily by date
    const handlePlayDailyByDate = () => {
        onPlayDaily(selectedDate);
        setIsOpen(false);
    };

    // Auto-verify current custom level
    const handleAutoVerify = () => {
        if (currentLevel && 'isVerified' in currentLevel) {
            const verifiedLevel: CustomLevel = {
                ...currentLevel,
                isVerified: true,
                lastModified: new Date().toISOString()
            };
            saveLevel(verifiedLevel);
            alert('✅ Level auto-verified!');
            onVerifyLevel?.();
        }
    };

    // Reset all progress
    const handleResetProgress = () => {
        if (confirm('Reset all progress? This will clear best scores.')) {
            localStorage.removeItem('target2048_scores');
            alert('Progress reset! Refresh the page.');
        }
    };

    // Unlock all levels (set best score to 1 for all)
    const handleUnlockAll = () => {
        const scores: Record<string | number, number> = {};
        INITIAL_LEVELS.forEach(level => {
            scores[level.id] = 1;
        });
        localStorage.setItem('target2048_scores', JSON.stringify(scores));
        alert('All levels unlocked! Refresh the page.');
    };

    // Group levels by section
    const levelsBySection = INITIAL_LEVELS.reduce((acc, level) => {
        const section = level.section || 'Other';
        if (!acc[section]) acc[section] = [];
        acc[section].push(level);
        return acc;
    }, {} as Record<string, Level[]>);

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
                    title="Dev Tools (Local Only)"
                >
                    <Settings size={24} />
                </button>
            )}

            {/* Dev Panel Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Settings size={24} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Dev Tools
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Local Development Only
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                <X size={24} className="text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 px-6 pt-4">
                            {[
                                { id: 'daily', label: 'Daily Puzzles', icon: Calendar },
                                { id: 'levels', label: 'All Levels', icon: List },
                                { id: 'quick', label: 'Quick Actions', icon: Zap }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === tab.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {/* Daily Puzzles Tab */}
                            {activeTab === 'daily' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Select Date
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 outline-none text-slate-800 dark:text-white"
                                            />
                                            <button
                                                onClick={handlePlayDailyByDate}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
                                            >
                                                Play →
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                            All Daily Levels ({DAILY_LEVELS.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                                            {DAILY_LEVELS.map((level, index) => (
                                                <button
                                                    key={level.id}
                                                    onClick={() => {
                                                        onJumpToLevel({ ...level, section: 'Daily', id: `daily-test-${index}` });
                                                        setIsOpen(false);
                                                    }}
                                                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition text-left"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-slate-800 dark:text-white">
                                                            {level.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            Target: {level.target} • Par: {level.par || '?'}
                                                        </div>
                                                    </div>
                                                    <div className="text-purple-600 dark:text-purple-400 font-bold">
                                                        #{index + 1}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Levels Tab */}
                            {activeTab === 'levels' && (
                                <div className="space-y-4">
                                    {Object.entries(levelsBySection).map(([section, levels]) => (
                                        <div key={section}>
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                                {section}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {levels.map(level => (
                                                    <button
                                                        key={level.id}
                                                        onClick={() => handleLevelJump(level.id as string)}
                                                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition text-left"
                                                    >
                                                        <div>
                                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                                {level.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                Target: {level.target}
                                                            </div>
                                                        </div>
                                                        <div className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                                                            {level.id}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Actions Tab */}
                            {activeTab === 'quick' && (
                                <div className="space-y-3">
                                    {currentLevel && 'isVerified' in currentLevel && !currentLevel.isVerified && (
                                        <button
                                            onClick={handleAutoVerify}
                                            className="w-full p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl text-left transition flex items-center gap-3"
                                        >
                                            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                                            <div>
                                                <div className="font-bold text-green-700 dark:text-green-300">
                                                    Auto-Verify Current Level
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400">
                                                    Skip play requirement for custom level
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleUnlockAll}
                                        className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl text-left transition flex items-center gap-3"
                                    >
                                        <Zap size={24} className="text-indigo-600 dark:text-indigo-400" />
                                        <div>
                                            <div className="font-bold text-indigo-700 dark:text-indigo-300">
                                                Unlock All Levels
                                            </div>
                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                Set best score for all levels (refresh required)
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleResetProgress}
                                        className="w-full p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-700 rounded-xl text-left transition flex items-center gap-3"
                                    >
                                        <Trash2 size={24} className="text-orange-600 dark:text-orange-400" />
                                        <div>
                                            <div className="font-bold text-orange-700 dark:text-orange-300">
                                                Reset All Progress
                                            </div>
                                            <div className="text-xs text-orange-600 dark:text-orange-400">
                                                Clear all best scores (refresh required)
                                            </div>
                                        </div>
                                    </button>

                                    <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Current Level Info
                                        </h4>
                                        {currentLevel ? (
                                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                <div><strong>Name:</strong> {currentLevel.name}</div>
                                                <div><strong>Target:</strong> {currentLevel.target}</div>
                                                <div><strong>Section:</strong> {currentLevel.section || 'N/A'}</div>
                                                {'isVerified' in currentLevel && (
                                                    <div><strong>Verified:</strong> {currentLevel.isVerified ? '✅ Yes' : '❌ No'}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">No level active</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DevPanel;