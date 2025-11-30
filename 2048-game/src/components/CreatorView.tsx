// CreatorView.tsx
import React, { useState } from 'react';
import { ChevronRight, Wand2, Sparkles, Loader2 } from 'lucide-react';
import type { Level } from '../types/types';
import { callGemini } from '../utils/utils';

interface CreatorViewProps {
    onBack: () => void;
    onPlayGenerated: (level: Level) => void;
}

const CreatorView: React.FC<CreatorViewProps> = ({ onBack, onPlayGenerated }) => {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        const aiPrompt = `Create a 2048 puzzle level: "${prompt}". JSON format: { "target": 64, "name": "Name", "description": "Desc", "grid": [[0,2,"WALL",4]...] }. Ensure solvable. Numbers must be powers of 2.`;

        try {
            const res = await callGemini(aiPrompt, "You are a level designer. Output JSON only.");
            const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            const newLevel: Level = { ...data, id: `ai-${Date.now()}`, section: "Custom" };
            onPlayGenerated(newLevel);
        } catch (e) {
            alert("Failed to generate level. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold ml-2">Level Creator</h2>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                    <Wand2 size={24} />
                    <span className="font-bold text-lg">AI Architect</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Describe your dream level. You can ask for shapes, difficulty levels, or specific wall patterns.</p>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'A smiley face made of walls' or 'A level where I start with 1024'"
                    className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none mb-4 text-slate-800 dark:text-slate-200 resize-none"
                />

                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isLoading}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate & Play</>}
                </button>
            </div>
        </div>
    );
};

export default CreatorView;