// src/components/LeaderboardModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Award, Clock, TrendingUp } from 'lucide-react';
import { getDailyLeaderboard, formatTime, type LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardModalProps {
    levelId: string;
    onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ levelId, onClose }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadLeaderboard();
    }, [levelId]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getDailyLeaderboard(levelId, 50);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-slate-400" size={24} />;
        if (rank === 3) return <Medal className="text-orange-600" size={24} />;
        return <div className="text-slate-400 font-bold text-lg w-6 text-center">{rank}</div>;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <Award className="text-indigo-600 dark:text-indigo-400" size={32} />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Global Leaderboard
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Top {entries.length} players
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                        <X size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                {/* Leaderboard List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                            <TrendingUp size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No entries yet</p>
                            <p className="text-sm">Be the first to complete this challenge!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry, index) => {
                                const rank = index + 1;
                                const isCurrentUser = entry.userId === user?.uid;

                                return (
                                    <div
                                        key={entry.userId}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrentUser
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                                            : rank <= 3
                                                ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30'
                                                : 'bg-slate-50 dark:bg-slate-700/20 hover:bg-slate-100 dark:hover:bg-slate-700/30'
                                            }`}
                                    >
                                        {/* Rank */}
                                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                            {getRankIcon(rank)}
                                        </div>

                                        {/* Username */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold truncate ${isCurrentUser
                                                ? 'text-indigo-700 dark:text-indigo-300'
                                                : 'text-slate-800 dark:text-white'
                                                }`}>
                                                {entry.username}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-4 text-sm">
                                            <div className="text-right">
                                                <div className="text-slate-400 dark:text-slate-500 text-xs">
                                                    Moves
                                                </div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">
                                                    {entry.moves}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1 justify-end">
                                                    <Clock size={10} /> Time
                                                </div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">
                                                    {formatTime(entry.time)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Rankings are based on moves first, then time. Lower is better!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;