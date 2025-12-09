// src/components/DevPanel.tsx
import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Zap, X, Trash2, Edit2, Plus, Upload, CheckCircle } from 'lucide-react';
import type { Level } from '../types/types';
import type { CustomLevel } from '../types/editorTypes';
import {
    publishDailyPuzzle,
    getAllScheduledPuzzles,
    deleteDailyPuzzle,
    getPuzzleByDate,
    hasPuzzleForDate,
    getDateKey,
    cleanupOldPuzzles
} from '../services/dailyPuzzleService';
import { saveLevel } from '../services/customLevelsStorage';

interface DevPanelProps {
    onJumpToLevel: (level: Level) => void;
    onPlayDaily: (date: string) => void;
    onEditLevel: (level: Level) => void;
    currentLevel?: Level | CustomLevel | null;
    onVerifyLevel?: () => void;
}

interface ScheduledPuzzle {
    dateKey: string;
    name: string;
    target: number;
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

    // Daily Puzzle State
    const [scheduledPuzzles, setScheduledPuzzles] = useState<ScheduledPuzzle[]>([]);
    const [loading, setLoading] = useState(false);
    const [publishMessage, setPublishMessage] = useState('');

    // Load scheduled puzzles when tab opens
    useEffect(() => {
        if (isOpen && activeTab === 'daily') {
            loadScheduledPuzzles();
        }
    }, [isOpen, activeTab]);

    const loadScheduledPuzzles = async () => {
        setLoading(true);
        try {
            const puzzles = await getAllScheduledPuzzles();
            setScheduledPuzzles(puzzles);

            // Auto-cleanup on load
            await cleanupOldPuzzles();
        } catch (error) {
            console.error('Failed to load puzzles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Play daily by date
    const handlePlayDailyByDate = () => {
        onPlayDaily(selectedDate);
        setIsOpen(false);
    };

    // Publish current level as daily
    const handlePublishCurrentLevel = async () => {
        if (!currentLevel) {
            alert('No level is currently loaded');
            return;
        }

        const dateKey = getDateKey(new Date(selectedDate));
        const exists = await hasPuzzleForDate(dateKey);

        if (exists) {
            const confirm = window.confirm(
                `⚠️ A puzzle already exists for ${selectedDate}.\nDo you want to OVERWRITE it?`
            );
            if (!confirm) return;
        }

        setLoading(true);
        setPublishMessage('');

        try {
            await publishDailyPuzzle(currentLevel, dateKey);
            setPublishMessage(`✅ Published to ${selectedDate}`);
            await loadScheduledPuzzles();

            setTimeout(() => setPublishMessage(''), 3000);
        } catch (error) {
            console.error('Publish failed:', error);
            alert('Failed to publish. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    // Edit existing daily puzzle
    const handleEditDailyPuzzle = async (dateKey: string) => {
        setLoading(true);
        try {
            const level = await getPuzzleByDate(dateKey);
            if (level) {
                onEditLevel(level);
                setIsOpen(false);
            } else {
                alert('Failed to load puzzle');
            }
        } catch (error) {
            console.error('Failed to load puzzle:', error);
            alert('Error loading puzzle');
        } finally {
            setLoading(false);
        }
    };

    // Delete daily puzzle
    const handleDeletePuzzle = async (dateKey: string) => {
        const confirm = window.confirm(
            `🗑️ Delete puzzle for ${dateKey}?\nThis cannot be undone.`
        );
        if (!confirm) return;

        setLoading(true);
        try {
            await deleteDailyPuzzle(dateKey);
            await loadScheduledPuzzles();
        } catch (error) {
            alert('Failed to delete puzzle');
        } finally {
            setLoading(false);
        }
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
                                        Daily Puzzle Management
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
                            {/* ========== DAILY PUZZLES TAB ========== */}
                            {activeTab === 'daily' && (
                                <div className="space-y-6">
                                    {/* Date Picker & Actions */}
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                                        <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                                            📅 Select Release Date
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 outline-none text-slate-800 dark:text-white mb-3 text-lg"
                                        />

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePlayDailyByDate}
                                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
                                            >
                                                🎮 Test Date
                                            </button>
                                            <button
                                                onClick={handlePublishCurrentLevel}
                                                disabled={!currentLevel || loading}
                                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                ) : (
                                                    <>
                                                        <Upload size={18} /> Publish Current
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {publishMessage && (
                                            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm text-center font-semibold">
                                                {publishMessage}
                                            </div>
                                        )}
                                    </div>

                                    {/* Scheduled Puzzles List */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                📆 Scheduled Puzzles ({scheduledPuzzles.length})
                                            </h3>
                                            <button
                                                onClick={loadScheduledPuzzles}
                                                disabled={loading}
                                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                🔄 Refresh
                                            </button>
                                        </div>

                                        {loading && scheduledPuzzles.length === 0 ? (
                                            <div className="flex justify-center py-10">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
                                            </div>
                                        ) : scheduledPuzzles.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400">
                                                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                                                <p>No puzzles scheduled yet</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                                {scheduledPuzzles.map((puzzle) => {
                                                    const date = new Date(puzzle.dateKey);
                                                    const isPast = date < new Date();
                                                    const isToday = puzzle.dateKey === getDateKey();

                                                    return (
                                                        <div
                                                            key={puzzle.dateKey}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${isToday
                                                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                                                    : isPast
                                                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-purple-300'
                                                                }`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-bold text-slate-800 dark:text-white text-sm">
                                                                    {puzzle.name}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                                    <span>{puzzle.dateKey}</span>
                                                                    <span>•</span>
                                                                    <span>Target: {puzzle.target}</span>
                                                                    {isToday && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-yellow-600 dark:text-yellow-400 font-bold">TODAY</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleEditDailyPuzzle(puzzle.dateKey)}
                                                                className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePuzzle(puzzle.dateKey)}
                                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ========== QUICK ACTIONS TAB ========== */}
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