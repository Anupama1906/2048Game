// src/components/UsernameModal.tsx
import React, { useState } from 'react';
import { User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './shared/Modal';
import { checkUsernameExists } from '../services/userService';

interface UsernameModalProps {
    onClose: () => void;   // Called on Cancel/Close X
    onSuccess: () => void; // Called on successful submission
}

const UsernameModal: React.FC<UsernameModalProps> = ({ onClose, onSuccess }) => {
    const [username, setInputUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUsername } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmed = username.trim();
        if (trimmed.length < 3) {
            return setError('Username must be at least 3 characters');
        }

        setLoading(true);
        try {
            // 1. Check uniqueness
            const exists = await checkUsernameExists(trimmed);
            if (exists) {
                setError('Username already exists. Please enter a new username.');
                setLoading(false);
                return;
            }

            // 2. Save if unique
            await setUsername(trimmed);
            onSuccess(); // Triggers the success action (entering the feature)
        } catch (e) {
            console.error(e);
            setError('Failed to save username. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose} // Allow closing
            title="Choose Username"
            subtitle="Required for Daily Puzzle & Community"
            icon={User}
            maxWidth="sm"
            showCloseButton={true} // Enable close button
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={username}
                            onChange={e => {
                                setInputUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter unique username"
                            className={`w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 outline-none transition
                                ${error
                                    ? 'border-red-500 focus:border-red-500 text-red-600'
                                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                                }`}
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                </div>
                <button
                    disabled={loading || username.trim().length < 3}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold flex justify-center gap-2 transition"
                >
                    {loading ? 'Checking...' : <><Sparkles size={20} /> Start Playing</>}
                </button>
            </form>
        </Modal>
    );
};

export default UsernameModal;