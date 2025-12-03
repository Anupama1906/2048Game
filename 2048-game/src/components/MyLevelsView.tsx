// src/components/MyLevelsView.tsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Edit2, Trash2, Play, Calendar, CheckCircle2, XCircle, Target, Trophy } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { getUserLevels, deleteLevel } from '../services/customLevelsStorage';
import { useAuth } from '../contexts/AuthContext';

interface MyLevelsViewProps {
    onBack: () => void;
    onCreateNew: () => void;
    onEdit: (level: CustomLevel) => void;
    onPlay: (level: CustomLevel) => void;
}

const MyLevelsView: React.FC<MyLevelsViewProps> = ({ onBack, onCreateNew, onEdit, onPlay }) => {
    const { username } = useAuth();
    const [levels, setLevels] = useState<CustomLevel[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);

    useEffect(() => {
        loadLevels();
    }, [username]);

    const loadLevels = () => {
        if (username) {
            const userLevels = getUserLevels(username);
            // Sort by newest first
            setLevels(userLevels.reverse());
        }
    };

    const handleDelete = (levelId: string | number) => {
        deleteLevel(levelId);
        loadLevels();
        setDeleteConfirm(null);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to get a color roughly matching the game tiles based on target
    const getTargetColor = (target: number) => {
        if (target >= 2048) return 'bg-yellow-500 text-white';
        if (target >= 128) return 'bg-yellow-400 text-white';
        if (target >= 8) return 'bg-orange-500 text-white';
        return 'bg-orange-200 text-slate-800';
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pt-6 sticky top-0 z-10 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow text-slate-600 dark:text-slate-300 font-bold active:scale-95"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                        <Edit2 size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                            My Levels
                        </h2>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                            {levels.length} Created
                        </p>
                    </div>
                </div>

                <div className="w-24" /> {/* Spacer for visual balance */}
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* 1. Create New Card */}
                    <button
                        onClick={onCreateNew}
                        className="group relative flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-3 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-300 active:scale-95"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 flex items-center justify-center mb-4">
                            <Plus size={32} className="text-purple-500" />
                        </div>
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-300">Create New Level</span>
                        <span className="text-sm text-purple-400 dark:text-purple-500 font-medium mt-1">Design your own puzzle</span>
                    </button>

                    {/* 2. Level List */}
                    {levels.map((level) => (
                        <div
                            key={level.id}
                            className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700"
                        >
                            {/* Top Row: Icon & Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${getTargetColor(level.target)}`}>
                                    {level.target}
                                </div>
                                {level.isVerified ? (
                                    <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                                        <CheckCircle2 size={14} /> Verified
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                                        <XCircle size={14} /> Draft
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {level.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5em]">
                                    {level.description || "No description provided."}
                                </p>
                            </div>

                            {/* Meta Data */}
                            <div className="flex items-center gap-4 mb-5 text-xs font-medium text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {formatDate(level.createdAt)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Target size={14} />
                                    Goal: {level.target}
                                </div>
                            </div>

                            {/* Actions Bar */}
                            {deleteConfirm === level.id ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        onClick={() => handleDelete(level.id)}
                                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/30"
                                    >
                                        Confirm Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onPlay(level)}
                                        className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <Play size={16} className="fill-current" />
                                        {level.isVerified ? 'Play' : 'Test'}
                                    </button>
                                    <button
                                        onClick={() => onEdit(level)}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition border border-slate-200 dark:border-slate-600"
                                        title="Edit Level"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(level.id)}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-800"
                                        title="Delete Level"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyLevelsView;