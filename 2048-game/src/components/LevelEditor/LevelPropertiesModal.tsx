// src/components/LevelEditor/LevelPropertiesModal.tsx
import React from 'react';
import { Settings, Target, Type, Columns, Rows, Plus, Minus } from 'lucide-react';
import { Modal } from '../shared/Modal';

interface LevelPropertiesModalProps {
    isOpen: boolean;
    rows: number;
    cols: number;
    targetValue: number;
    levelName: string;
    levelDescription: string;
    onClose: () => void;
    onRowsChange: (v: number) => void;
    onColsChange: (v: number) => void;
    onTargetChange: (v: number) => void;
    onNameChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
}

export const LevelPropertiesModal: React.FC<LevelPropertiesModalProps> = ({
    isOpen,
    rows,
    cols,
    targetValue,
    levelName,
    levelDescription,
    onClose,
    onRowsChange,
    onColsChange,
    onTargetChange,
    onNameChange,
    onDescriptionChange
}) => {
    // Derived state for the UI
    const sign = targetValue >= 0 ? 1 : -1;
    const absValue = Math.abs(targetValue);

    const handleSignChange = (newSign: 1 | -1) => {
        onTargetChange(absValue * newSign);
    };

    const handleValueChange = (newVal: number) => {
        onTargetChange(newVal * sign);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Level Properties"
            subtitle="Configure dimensions and goals"
            icon={Settings}
            iconColor="text-slate-600 dark:text-slate-300"
        >
            <div className="space-y-6 p-2">
                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Rows size={16} /> Rows
                        </label>
                        <div className="flex gap-1">
                            {[3, 4, 5, 6, 7].map((size) => (
                                <button
                                    key={`r-${size}`}
                                    onClick={() => onRowsChange(size)}
                                    className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition ${rows === size
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Columns size={16} /> Cols
                        </label>
                        <div className="flex gap-1">
                            {[3, 4, 5, 6, 7].map((size) => (
                                <button
                                    key={`c-${size}`}
                                    onClick={() => onColsChange(size)}
                                    className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition ${cols === size
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Target Selector (Split Sign and Value) */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <Target size={16} /> Target Value
                    </label>
                    <div className="flex gap-3">
                        {/* Sign Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border-2 border-slate-200 dark:border-slate-700 shrink-0">
                            <button
                                onClick={() => handleSignChange(1)}
                                className={`p-2 rounded-lg transition ${sign === 1
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 dark:text-green-400'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Positive"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => handleSignChange(-1)}
                                className={`p-2 rounded-lg transition ${sign === -1
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Negative"
                            >
                                <Minus size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Value Dropdown */}
                        <div className="flex-1 relative">
                            <select
                                value={absValue}
                                onChange={(e) => handleValueChange(Number(e.target.value))}
                                className={`w-full h-full px-4 rounded-xl border-2 outline-none font-bold appearance-none text-center cursor-pointer transition
                                    ${sign === 1
                                        ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 focus:border-orange-500'
                                        : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 focus:border-blue-500'
                                    }`}
                            >
                                {[2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            {/* Custom Arrow for better styling control */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Fields */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <Type size={16} /> Level Info
                    </label>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={levelName}
                            onChange={e => onNameChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition"
                            placeholder="Level Name"
                        />
                        <input
                            type="text"
                            value={levelDescription}
                            onChange={e => onDescriptionChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition"
                            placeholder="Description (Optional)"
                        />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95"
                >
                    Apply Changes
                </button>
            </div>
        </Modal>
    );
};