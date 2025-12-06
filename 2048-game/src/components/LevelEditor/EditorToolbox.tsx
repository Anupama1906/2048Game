// src/components/LevelEditor/EditorToolbox.tsx
import React from 'react';
import { Eraser, Info } from 'lucide-react';
import {
    POSITIVE_TILES,
    NEGATIVE_TILES,
    WALL_TOOLS,
    MECHANIC_TOOLS,
    EMPTY_TOOL,
    type EditorTool,
    type TileCategory
} from '../../types/editorTypes';
import MiniTile from '../MiniTile';

interface EditorToolboxProps {
    activeCategory: TileCategory;
    selectedTool: EditorTool;
    wallMode: string;
    onCategoryChange: (category: TileCategory) => void;
    onToolSelect: (tool: EditorTool, mode?: 'tile' | 'thin-v' | 'thin-h') => void;
}

export const EditorToolbox: React.FC<EditorToolboxProps> = ({
    activeCategory,
    selectedTool,
    wallMode,
    onCategoryChange,
    onToolSelect
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border-2 border-slate-200 dark:border-slate-700 w-full md:w-80 flex-shrink-0 flex flex-col md:h-auto shrink-0 shadow-sm">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-3 shrink-0">
                <button onClick={() => onCategoryChange('tiles')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'tiles' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Tiles</button>
                <button onClick={() => onCategoryChange('walls')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'walls' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Walls</button>
                <button onClick={() => onCategoryChange('mechanics')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'mechanics' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Mechanics</button>
            </div>

            {/* Scrollable Tool List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[30vh] md:max-h-none">
                {activeCategory === 'tiles' && (
                    <div className="space-y-4">
                        <button onClick={() => onToolSelect(EMPTY_TOOL, 'tile')} className={`w-full p-3 rounded-lg border-2 transition font-semibold flex items-center gap-3 ${selectedTool.type === 'empty' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            <Eraser size={20} /><span>Clear Cell</span>
                        </button>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Positive</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {POSITIVE_TILES.map(tool => (
                                    <button key={tool.value} onClick={() => onToolSelect(tool, 'tile')} className={`p-2 rounded-lg border-2 transition ${selectedTool.value === tool.value && selectedTool.type === 'number' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        <MiniTile value={tool.value!} size="sm" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Negative</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {NEGATIVE_TILES.map(tool => (
                                    <button key={tool.value} onClick={() => onToolSelect(tool, 'tile')} className={`p-2 rounded-lg border-2 transition ${selectedTool.value === tool.value && selectedTool.type === 'number' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        <MiniTile value={tool.value!} size="sm" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeCategory === 'walls' && (
                    <div className="space-y-3">
                        {WALL_TOOLS.map((tool, idx) => (
                            <button key={idx} onClick={() => {
                                const mode = tool.label.includes('|') ? 'thin-v' : tool.label.includes('—') ? 'thin-h' : 'tile';
                                onToolSelect(tool, mode);
                            }} className={`w-full p-3 rounded-xl border-2 transition font-semibold flex items-center gap-4 ${selectedTool === tool ? 'border-slate-700 bg-slate-200 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                                <span className="text-2xl">{tool.icon || (tool.label.includes('|') ? '|' : '—')}</span>
                                <span className="text-sm">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {activeCategory === 'mechanics' && (
                    <div className="space-y-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 p-3 rounded-lg text-xs text-purple-700 dark:text-purple-300">
                            <Info size={14} className="inline mr-1" /> Select a number first, then apply mechanic.
                        </div>
                        {MECHANIC_TOOLS.map((tool, idx) => (
                            <button key={idx} onClick={() => onToolSelect(tool, 'tile')} className={`w-full p-3 rounded-xl border-2 transition font-semibold flex items-center gap-4 ${selectedTool.mechanic === tool.mechanic ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <span className="text-2xl">{tool.icon}</span>
                                <div className="text-left">
                                    <div>{tool.label}</div>
                                    <div className="text-[10px] opacity-70 font-normal">{tool.mechanic === 'locked' ? 'Trap/Lock' : tool.mechanic}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};