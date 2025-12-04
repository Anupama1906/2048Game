// src/components/shared/LevelCard.tsx
import React from 'react';
import { Play, Edit2, Trash2, Share2, CheckCircle2, XCircle, Calendar, Target, User } from 'lucide-react';
import type { CustomLevel } from '../../types/editorTypes';

interface LevelCardProps {
    level: CustomLevel;
    variant?: 'owner' | 'community'; // Added variant prop
    onPlay: (level: CustomLevel) => void;
    onEdit?: (level: CustomLevel) => void;
    onDelete?: (level: CustomLevel) => void; // Changed to accept full level for consistency
    onShare?: (level: CustomLevel) => void;
    confirmDeleteId?: string | number | null; // Added for MyLevelsView
    onCancelDelete?: () => void;              // Added for MyLevelsView
}

export const LevelCard: React.FC<LevelCardProps> = ({
    level,
    variant = 'owner', // Default to owner
    onPlay,
    onEdit,
    onDelete,
    onShare,
    confirmDeleteId,
    onCancelDelete
}) => {
    // Helper to format date
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    // Helper for target color
    const getTargetColor = (t: number) => {
        if (t >= 2048) return 'bg-yellow-500 text-white';
        if (t >= 128) return 'bg-yellow-400 text-white';
        if (t >= 8) return 'bg-orange-500 text-white';
        return 'bg-orange-200 text-slate-800';
    };

    const isConfirmingDelete = confirmDeleteId === level.id;

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700">
            {/* Top Row: Target & Status/Code */}
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${getTargetColor(level.target)}`}>
                    {level.target}
                </div>

                {variant === 'owner' ? (
                    level.isVerified ? (
                        <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <CheckCircle2 size={14} /> Verified
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <XCircle size={14} /> Draft
                        </div>
                    )
                ) : (
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wider">
                            {level.shareCode}
                        </span>
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
                {variant === 'owner' ? (
                    <>
                        <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(level.createdAt)}</div>
                        <div className="flex items-center gap-1.5"><Target size={14} /> Goal: {level.target}</div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5"><User size={14} /> {level.createdBy}</div>
                        <div className="flex items-center gap-1.5"><Play size={14} /> {(level as any).plays || 0} plays</div>
                    </>
                )}
            </div>

            {/* Actions */}
            {isConfirmingDelete ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <button
                        onClick={() => onDelete?.(level)}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/30"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancelDelete}
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
                        {variant === 'owner' && !level.isVerified ? 'Test' : 'Play'}
                    </button>

                    {variant === 'owner' && (
                        <>
                            {level.isVerified && (
                                <button onClick={() => onShare?.(level)} className="p-2.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 transition">
                                    <Share2 size={18} />
                                </button>
                            )}
                            <button onClick={() => onEdit?.(level)} className="p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 transition">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => onDelete?.(level)} className="p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-600 transition">
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};