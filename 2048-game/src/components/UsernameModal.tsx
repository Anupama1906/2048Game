// src/components/UsernameModal.tsx
import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './shared/Modal';

interface UsernameModalProps {
    onClose: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ onClose }) => {
    const [username, setInputUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUsername } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (Keep existing validation logic)
        if (username.length < 3) return setError('Too short');

        setLoading(true);
        try {
            await setUsername(username.trim());
            onClose();
        } catch (e) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Choose Username"
            subtitle="For the global leaderboard"
            icon={User}
            maxWidth="sm"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <input
                        autoFocus
                        type="text"
                        value={username}
                        onChange={e => setInputUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <button disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2">
                    {loading ? 'Saving...' : <><Sparkles size={20} /> Continue</>}
                </button>
            </form>
        </Modal>
    );
};

export default UsernameModal;