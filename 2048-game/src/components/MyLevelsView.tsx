// src/components/MyLevelsView.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Copy, Check, Share2, CheckCircle2 } from 'lucide-react';
import type { CustomLevel } from '../types/editorTypes';
import { getUserLevels, deleteLevel } from '../services/customLevelsStorage';
import { shareLevel } from '../services/sharedLevelsService';
import { useAuth } from '../contexts/AuthContext';
import { ViewHeader } from './shared/ViewHeader';
import { LevelCard } from './shared/LevelCard';

interface MyLevelsViewProps {
    onBack: () => void;
    onCreateNew: () => void;
    onEdit: (level: CustomLevel) => void;
    onPlay: (level: CustomLevel) => void;
}

const MyLevelsView: React.FC<MyLevelsViewProps> = ({ onBack, onCreateNew, onEdit, onPlay }) => {
    const { userId } = useAuth();
    const [levels, setLevels] = useState<CustomLevel[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
    const [sharingLevel, setSharingLevel] = useState<string | number | null>(null);
    const [shareCode, setShareCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadLevels();
    }, [userId]);

    const loadLevels = () => {
        if (userId) {
            const userLevels = getUserLevels(userId);
            setLevels(userLevels.reverse());
        }
    };

    const handleDelete = (level: CustomLevel) => {
        if (deleteConfirm === level.id) {
            deleteLevel(level.id);
            loadLevels();
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(level.id);
        }
    };

    const handleShare = async (level: CustomLevel) => {
        setSharingLevel(level.id);
        setShareCode(null);
        setCopied(false);
        try {
            const code = await shareLevel(level);
            setShareCode(code);
        } catch (error: any) {
            alert(error.message || 'Failed to share level.');
            setSharingLevel(null);
        }
    };

    const handleCopyCode = () => {
        if (shareCode) {
            navigator.clipboard.writeText(shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <ViewHeader
                onBack={onBack}
                title="My Levels"
                subtitle={`${levels.length} Created`}
                icon={Edit2}
                iconColor="text-purple-600 dark:text-purple-400"
            />

            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Create New Card */}
                    <button
                        onClick={onCreateNew}
                        className="group flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-3 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 transition-all duration-300 active:scale-95"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 flex items-center justify-center mb-4">
                            <Plus size={32} className="text-purple-500" />
                        </div>
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-300">Create New Level</span>
                    </button>

                    {/* Level List */}
                    {levels.map((level) => (
                        <LevelCard
                            key={level.id}
                            level={level}
                            variant="owner"
                            onPlay={onPlay}
                            onEdit={onEdit}
                            onDelete={() => handleDelete(level)} 
                            onShare={handleShare}
                            confirmDeleteId={deleteConfirm}
                            onCancelDelete={() => setDeleteConfirm(null)}
                        />
                    ))}
                </div>
            </div>

            {/* Share Modal (Inline for now, could use generic Modal) */}
            {sharingLevel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in duration-200">
                        {shareCode ? (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                        <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Level Shared!</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Share this code with others</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 mb-6">
                                    <div className="text-4xl font-black text-center tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">{shareCode}</div>
                                    <button onClick={handleCopyCode} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                        {copied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy Code</>}
                                    </button>
                                </div>
                                <button onClick={() => { setSharingLevel(null); setShareCode(null); }} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold">Done</button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4" />
                                <p className="text-slate-500">Generating code...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLevelsView;