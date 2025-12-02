// src/components/UsernameModal.tsx
import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UsernameModalProps {
    onClose: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ onClose }) => {
    const [inputUsername, setInputUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUsername } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (inputUsername.trim().length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (inputUsername.trim().length > 20) {
            setError('Username must be less than 20 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(inputUsername)) {
            setError('Username can only contain letters, numbers, and underscores');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await setUsername(inputUsername.trim());
            onClose();
        } catch (err) {
            setError('Failed to set username. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <User size={28} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            Choose Username
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            For the global leaderboard
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-800 dark:text-white transition"
                            maxLength={20}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            3-20 characters, letters, numbers, and underscores only
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || inputUsername.trim().length < 3}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Continue
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameModal;