// src/components/DevPanel.tsx
import React, { useState } from 'react';
import { Settings, Calendar, Zap, X, CheckCircle, Trash2, Edit2, Plus } from 'lucide-react';
import type { Level } from '../types/types';
import type { CustomLevel } from '../types/editorTypes';
import { DAILY_LEVELS } from '../data/dailyLevels';
import { saveLevel } from '../services/customLevelsStorage';

interface DevPanelProps {
    onJumpToLevel: (level: Level) => void;
    onPlayDaily: (date: string) => void;
    onEditLevel: (level: Level, isNew?: boolean) => void; // Updated signature
    currentLevel?: Level | CustomLevel | null;
    onVerifyLevel?: () => void;
}

const DevPanel: React.FC<DevPanelProps> = ({
    onJumpToLevel,
    onPlayDaily,
    onEditLevel,
    currentLevel,
    onVerifyLevel
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'daily' | 'quick'>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
                                <div className="space-y-6">
                                    {/* Date Selector */}
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                            Test Specific Date
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
                                                Play
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit / Create */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Daily Levels ({DAILY_LEVELS.length})
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    // Create a dummy new level
                                                    const newLevel: Level = {
                                                        id: `daily-${DAILY_LEVELS.length + 1}`,
                                                        name: 'New Daily',
                                                        description: 'Description here',
                                                        target: 64,
                                                        grid: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                                                        section: 'Daily'
                                                    };
                                                    onEditLevel(newLevel, true);
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-1 text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                                            >
                                                <Plus size={14} /> New
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                            {DAILY_LEVELS.map((level, index) => (
                                                <div key={level.id} className="flex gap-2 group">
                                                    <button
                                                        onClick={() => {
                                                            onJumpToLevel({ ...level, section: 'Daily', id: `daily-test-${index}` });
                                                            setIsOpen(false);
                                                        }}
                                                        className="flex-1 flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition text-left"
                                                    >
                                                        <div>
                                                            <div className="font-semibold text-slate-800 dark:text-white text-sm">
                                                                {level.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                                Target: {level.target} • ID: {level.id}
                                                            </div>
                                                        </div>
                                                        <div className="text-purple-600 dark:text-purple-400 font-bold text-xs bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                                                            #{index + 1}
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onEditLevel(level);
                                                            setIsOpen(false);
                                                        }}
                                                        className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-600 transition flex items-center justify-center"
                                                        title="Edit this level code"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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