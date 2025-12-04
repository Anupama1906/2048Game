// src/components/LeaderboardModal.tsx
import React, { useEffect, useState } from 'react';
import { Award, Trophy, Medal, Clock, TrendingUp } from 'lucide-react';
import { getDailyLeaderboard, formatTime, type LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './shared/Modal';

interface LeaderboardModalProps {
    levelId: string;
    onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ levelId, onClose }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getDailyLeaderboard(levelId, 50);
                setEntries(data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [levelId]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-slate-400" size={24} />;
        if (rank === 3) return <Medal className="text-orange-600" size={24} />;
        return <span className="text-slate-400 font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Leaderboard"
            subtitle={`Top ${entries.length} players`}
            icon={Award}
            maxWidth="2xl"
        >
            <div className="p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" /></div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No entries yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry, idx) => {
                            const isMe = entry.userId === user?.uid;
                            return (
                                <div key={entry.userId} className={`flex items-center gap-4 p-4 rounded-xl ${isMe ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50'}`}>
                                    <div className="w-8 flex justify-center">{getRankIcon(idx + 1)}</div>
                                    <div className="flex-1 font-bold text-slate-800">{entry.username} {isMe && '(You)'}</div>
                                    <div className="text-right text-sm">
                                        <div className="font-bold text-indigo-600">{entry.moves} moves</div>
                                        <div className="text-slate-500 text-xs flex items-center justify-end gap-1"><Clock size={10} /> {formatTime(entry.time)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LeaderboardModal;