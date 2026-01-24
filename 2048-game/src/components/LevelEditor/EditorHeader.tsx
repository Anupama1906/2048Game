// src/components/LevelEditor/EditorHeader.tsx
import React from 'react';
import { Settings, Eraser, Play, Save, Edit2, Check, FileCode } from 'lucide-react';
import { ViewHeader } from '../shared/ViewHeader';

interface EditorHeaderProps {
    title: string;
    subtitle: string;
    saveMode: 'local' | 'export';
    copiedCode: boolean;
    onBack: () => void;
    onSettings: () => void;
    onClear: () => void;
    onTest: () => void;
    onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    title,
    subtitle,
    saveMode,
    copiedCode,
    onBack,
    onSettings,
    onClear,
    onTest,
    onSave
}) => {
    return (
        <ViewHeader
            onBack={onBack}
            title={title}
            subtitle={subtitle}
            icon={Edit2}
            iconColor={saveMode === 'export' ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}
            sticky={false}
            rightContent={
                <div className="flex gap-2">
                    <button
                        onClick={onSettings}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                        title="Level Properties"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={onClear}
                        className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="Clear Grid"
                    >
                        <Eraser size={20} />
                    </button>

                    <button
                        onClick={onTest}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex gap-2 transition"
                    >
                        <Play size={18} />
                        <span className="hidden sm:inline">Publish</span>
                    </button>

                    <button
                        onClick={onSave}
                        className={`px-3 py-2 text-white rounded-lg font-bold flex gap-2 transition ${saveMode === 'export'
                            ? copiedCode ? 'bg-green-600' : 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                    >
                        {saveMode === 'export'
                            ? (copiedCode ? <Check size={18} /> : <FileCode size={18} />)
                            : <Save size={18} />
                        }
                        <span className="hidden sm:inline">
                            {saveMode === 'export' ? (copiedCode ? 'Copied!' : 'Copy Code') : 'Save'}
                        </span>
                    </button>
                </div>
            }
        />
    );
};