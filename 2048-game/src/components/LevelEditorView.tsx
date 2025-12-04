// src/components/LevelEditorView.tsx
import React, { useState, useEffect } from 'react';
import { Settings, Eraser, Play, Save, Edit2, Info } from 'lucide-react';
import type { CustomLevel, EditorMode, EditorTool } from '../types/editorTypes';
import type { Grid, Cell } from '../types/types';
import { POSITIVE_TILES, NEGATIVE_TILES, WALL_TOOLS, MECHANIC_TOOLS, EMPTY_TOOL } from '../types/editorTypes';
import { WALL } from '../constants/game';
import { useAuth } from '../contexts/AuthContext';
import { saveLevel, generateLevelId } from '../services/customLevelsStorage';
import Tile from './Tile';
import MiniTile from './MiniTile';
import { ViewHeader } from './shared/ViewHeader';

interface LevelEditorViewProps {
    existingLevel?: CustomLevel | null;
    onBack: () => void;
    onPlayTest: (level: CustomLevel) => void;
}

const LevelEditorView: React.FC<LevelEditorViewProps> = ({ existingLevel, onBack, onPlayTest }) => {
    const { userId } = useAuth();

    // State
    const [mode, setMode] = useState<EditorMode>('edit');
    const [selectedTool, setSelectedTool] = useState<EditorTool>(EMPTY_TOOL);
    const [grid, setGrid] = useState<Grid>(Array(4).fill(null).map(() => Array(4).fill(0)));
    const [gridSize, setGridSize] = useState<3 | 4 | 5 | 6>(4);
    const [levelName, setLevelName] = useState('My Level');
    const [levelDescription, setLevelDescription] = useState('');
    const [targetValue, setTargetValue] = useState(64);
    const [showSettings, setShowSettings] = useState(false);
    const [thinWalls, setThinWalls] = useState<{ vertical: [number, number][]; horizontal: [number, number][]; }>({ vertical: [], horizontal: [] });
    const [wallMode, setWallMode] = useState<'tile' | 'thin-v' | 'thin-h'>('tile');
    const [activeCategory, setActiveCategory] = useState<'tiles' | 'walls' | 'mechanics'>('tiles');

    // Load existing level
    useEffect(() => {
        if (existingLevel) {
            setGrid(existingLevel.grid as Grid);
            setGridSize(existingLevel.grid.length as 3 | 4 | 5 | 6);
            setLevelName(existingLevel.name);
            setLevelDescription(existingLevel.description);
            setTargetValue(existingLevel.target);
            if (existingLevel.thinWalls) setThinWalls(existingLevel.thinWalls);
        } else {
            setGrid(Array(4).fill(null).map(() => Array(4).fill(0)));
            setGridSize(4);
        }
    }, [existingLevel]);

    function createEmptyGrid(size: number): Grid {
        return Array(size).fill(null).map(() => Array(size).fill(0));
    }

    const handleGridSizeChange = (newSize: 3 | 4 | 5 | 6) => {
        if (confirm(`Change grid size to ${newSize}x${newSize}? This will clear the current grid.`)) {
            setGridSize(newSize);
            setGrid(createEmptyGrid(newSize));
            setThinWalls({ vertical: [], horizontal: [] });
        }
    };

    // Helper to switch category AND select the first tool automatically (UX improvement)
    const handleCategoryChange = (category: 'tiles' | 'walls' | 'mechanics') => {
        setActiveCategory(category);
        if (category === 'tiles') setSelectedTool(POSITIVE_TILES[0]);
        else if (category === 'walls') { setSelectedTool(WALL_TOOLS[0]); setWallMode('tile'); }
        else if (category === 'mechanics') setSelectedTool(MECHANIC_TOOLS[0]);
    };

    const handleCellClick = (rowIdx: number, colIdx: number) => {
        if (mode !== 'edit') return;

        // Thin Walls Logic
        if (wallMode === 'thin-v') {
            if (colIdx < gridSize - 1) {
                setThinWalls(prev => {
                    const exists = prev.vertical.some(([r, c]) => r === rowIdx && c === colIdx);
                    return { ...prev, vertical: exists ? prev.vertical.filter(([r, c]) => !(r === rowIdx && c === colIdx)) : [...prev.vertical, [rowIdx, colIdx]] };
                });
            }
            return;
        }
        if (wallMode === 'thin-h') {
            if (rowIdx < gridSize - 1) {
                setThinWalls(prev => {
                    const exists = prev.horizontal.some(([r, c]) => r === rowIdx && c === colIdx);
                    return { ...prev, horizontal: exists ? prev.horizontal.filter(([r, c]) => !(r === rowIdx && c === colIdx)) : [...prev.horizontal, [rowIdx, colIdx]] };
                });
            }
            return;
        }

        // Standard Cell Logic
        const newGrid = grid.map(row => [...row]);
        let newValue: Cell;
        const currentCell = grid[rowIdx][colIdx];

        const getCurrentValue = (cell: Cell): number => {
            if (typeof cell === 'number') return cell;
            if (typeof cell === 'object' && cell !== null && 'value' in cell) return cell.value;
            return 0;
        };

        if (selectedTool.type === 'empty') newValue = 0;
        else if (selectedTool.type === 'number') newValue = selectedTool.value || 0;
        else if (selectedTool.type === 'wall') newValue = WALL;
        else if (selectedTool.type === 'mechanic') {
            const baseValue = getCurrentValue(currentCell);
            if (selectedTool.mechanic === 'locked') newValue = { type: 'locked', value: baseValue };
            else if (selectedTool.mechanic === 'generator') newValue = { type: 'generator', value: baseValue };
            else if (selectedTool.mechanic === 'sticky') newValue = { type: 'sticky', value: baseValue };
            else if (selectedTool.mechanic === 'temporary') {
                if (typeof currentCell === 'object' && currentCell !== null && (currentCell as any).type === 'temporary') {
                    const nextLimit = ((currentCell as any).limit || 1) >= 3 ? 1 : ((currentCell as any).limit || 1) + 1;
                    newValue = { type: 'temporary', value: baseValue, limit: nextLimit };
                } else {
                    newValue = { type: 'temporary', value: baseValue, limit: 1 };
                }
            } else newValue = 0;
        } else newValue = 0;

        newGrid[rowIdx][colIdx] = newValue;
        setGrid(newGrid);
    };

    const handleSave = () => {
        if (!userId) return;
        const level: CustomLevel = {
            id: existingLevel?.id || generateLevelId(userId),
            name: levelName,
            description: levelDescription,
            target: targetValue,
            grid: grid as any,
            section: 'Custom',
            createdBy: userId,
            createdAt: existingLevel?.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isVerified: existingLevel?.isVerified || false,
            thinWalls: (thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0) ? thinWalls : undefined
        };
        saveLevel(level);
        alert('Level saved! Play and win to verify it.');
        onBack();
    };

    const handlePlayTest = () => {
        if (!userId) return;
        const level: CustomLevel = {
            id: existingLevel?.id || generateLevelId(userId),
            name: levelName,
            description: levelDescription,
            target: targetValue,
            grid: grid as any,
            section: 'Custom',
            createdBy: userId,
            createdAt: existingLevel?.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isVerified: false,
            thinWalls: (thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0) ? thinWalls : undefined
        };
        onPlayTest(level);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header - Non-sticky to allow scrolling naturally */}
            <ViewHeader
                onBack={onBack}
                title="Level Editor"
                subtitle={existingLevel ? "Editing" : "Creating"}
                icon={Edit2}
                iconColor="text-purple-600 dark:text-purple-400"
                sticky={false}
                rightContent={
                    <div className="flex gap-2">
                        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`} title="Settings"><Settings size={20} /></button>
                        <button onClick={() => { if (confirm('Clear grid?')) setGrid(createEmptyGrid(gridSize)); }} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300" title="Clear"><Eraser size={20} /></button>
                        <button onClick={handlePlayTest} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex gap-2"><Play size={18} /><span className="hidden sm:inline">Test</span></button>
                        <button onClick={handleSave} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex gap-2"><Save size={18} /><span className="hidden sm:inline">Save</span></button>
                    </div>
                }
            />

            {showSettings && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 border-2 border-slate-200 dark:border-slate-700 shrink-0 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Grid Size</label>
                            <select value={gridSize} onChange={(e) => handleGridSizeChange(Number(e.target.value) as any)} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none text-slate-800 dark:text-white">
                                <option value={3}>3x3</option><option value={4}>4x4</option><option value={5}>5x5</option><option value={6}>6x6</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Target</label>
                            <select value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none text-slate-800 dark:text-white">
                                {[4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-500 block mb-1">Level Name</label>
                            <input type="text" value={levelName} onChange={e => setLevelName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none text-slate-800 dark:text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Layout: Flex-col-reverse puts Toolbox at BOTTOM on mobile, Grid at TOP. Scrolling enabled (overflow-y-auto). */}
            <div className="flex-1 flex flex-col-reverse md:flex-row gap-4 overflow-y-auto md:overflow-hidden pb-4 custom-scrollbar">

                {/* Toolbox */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border-2 border-slate-200 dark:border-slate-700 w-full md:w-80 flex-shrink-0 flex flex-col md:h-auto shrink-0">
                    <div className="flex gap-2 mb-3 shrink-0">
                        <button onClick={() => handleCategoryChange('tiles')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'tiles' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Tiles</button>
                        <button onClick={() => handleCategoryChange('walls')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'walls' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Walls</button>
                        <button onClick={() => handleCategoryChange('mechanics')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'mechanics' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Mechanics</button>
                    </div>

                    {/* Max Height on mobile prevents toolbox from eating the whole screen, forcing grid off. */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[30vh] md:max-h-none">
                        {activeCategory === 'tiles' && (
                            <div className="space-y-4">
                                <button onClick={() => { setSelectedTool(EMPTY_TOOL); setWallMode('tile'); }} className={`w-full p-3 rounded-lg border-2 transition font-semibold flex items-center gap-3 ${selectedTool.type === 'empty' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                    <Eraser size={20} /><span>Clear Cell</span>
                                </button>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Positive</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {POSITIVE_TILES.map(tool => (
                                            <button key={tool.value} onClick={() => { setSelectedTool(tool); setWallMode('tile'); }} className={`p-2 rounded-lg border-2 transition ${selectedTool.value === tool.value && selectedTool.type === 'number' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                                <MiniTile value={tool.value!} size="sm" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Negative</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {NEGATIVE_TILES.map(tool => (
                                            <button key={tool.value} onClick={() => { setSelectedTool(tool); setWallMode('tile'); }} className={`p-2 rounded-lg border-2 transition ${selectedTool.value === tool.value && selectedTool.type === 'number' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
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
                                        if (tool.label.includes('|')) { setWallMode('thin-v'); setSelectedTool(tool); }
                                        else if (tool.label.includes('—')) { setWallMode('thin-h'); setSelectedTool(tool); }
                                        else { setWallMode('tile'); setSelectedTool(tool); }
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
                                    <button key={idx} onClick={() => { setWallMode('tile'); setSelectedTool(tool); }} className={`w-full p-3 rounded-xl border-2 transition font-semibold flex items-center gap-4 ${selectedTool.mechanic === tool.mechanic ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
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

                {/* Grid Area - Min-height ensures it's never crushed */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] bg-slate-100 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <div className="bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full max-w-[400px]">
                        <div className="grid gap-2 relative mx-auto" style={{
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                            width: '100%',
                            aspectRatio: '1/1'
                        }}>
                            {grid.map((row, r) => row.map((cell, c) => (
                                <button key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} className="relative w-full h-full hover:ring-2 hover:ring-purple-400 rounded-lg transition active:scale-95">
                                    <Tile value={cell} boardSize={gridSize} />
                                    {thinWalls.vertical.map(([wr, wc], i) => (wr === r && wc === c) && <div key={`v-${i}`} className="absolute right-[-3px] top-0 bottom-0 w-[6px] bg-slate-800 dark:bg-slate-200 rounded-full z-20 pointer-events-none" />)}
                                    {thinWalls.horizontal.map(([wr, wc], i) => (wr === r && wc === c) && <div key={`h-${i}`} className="absolute bottom-[-3px] left-0 right-0 h-[6px] bg-slate-800 dark:bg-slate-200 rounded-full z-20 pointer-events-none" />)}
                                </button>
                            )))}
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Selected: <span className="font-bold text-indigo-600">{selectedTool.label}</span></p>
                </div>
            </div>
        </div>
    );
};

export default LevelEditorView;