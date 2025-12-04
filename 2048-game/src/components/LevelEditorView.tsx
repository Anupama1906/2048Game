// src/components/LevelEditorView.tsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Save, Settings, Eraser, Info } from 'lucide-react';
import type { Cell, Grid } from '../types/types';
import type { CustomLevel, EditorMode, EditorTool } from '../types/editorTypes';
import { POSITIVE_TILES, NEGATIVE_TILES, WALL_TOOLS, MECHANIC_TOOLS, EMPTY_TOOL } from '../types/editorTypes';
import { useAuth } from '../contexts/AuthContext';
import { saveLevel, generateLevelId } from '../services/customLevelsStorage';
import Tile from './Tile';
import MiniTile from './MiniTile';
import { WALL } from '../constants/game';

interface LevelEditorViewProps {
    existingLevel?: CustomLevel | null;
    onBack: () => void;
    onPlayTest: (level: CustomLevel) => void;
}

const LevelEditorView: React.FC<LevelEditorViewProps> = ({ existingLevel, onBack, onPlayTest }) => {
    const { userId } = useAuth();
    const [mode, setMode] = useState<EditorMode>('edit');
    const [selectedTool, setSelectedTool] = useState<EditorTool>(EMPTY_TOOL);
    const [grid, setGrid] = useState<Grid>(createEmptyGrid(4));
    const [gridSize, setGridSize] = useState<3 | 4 | 5 | 6>(4);
    const [levelName, setLevelName] = useState('My Level');
    const [levelDescription, setLevelDescription] = useState('');
    const [targetValue, setTargetValue] = useState(64);
    const [showSettings, setShowSettings] = useState(false);
    const [thinWalls, setThinWalls] = useState<{
        vertical: [number, number][];
        horizontal: [number, number][];
    }>({ vertical: [], horizontal: [] });
    const [wallMode, setWallMode] = useState<'tile' | 'thin-v' | 'thin-h'>('tile');
    const [activeCategory, setActiveCategory] = useState<'tiles' | 'walls' | 'mechanics'>('tiles');

    useEffect(() => {
        if (existingLevel) {
            const levelGrid = existingLevel.grid as Grid;
            const size = levelGrid.length as 3 | 4 | 5 | 6;
            setGridSize(size);
            setGrid(levelGrid);
            setLevelName(existingLevel.name);
            setLevelDescription(existingLevel.description);
            setTargetValue(existingLevel.target);
            if (existingLevel.thinWalls) {
                setThinWalls(existingLevel.thinWalls);
            }
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

    const handleCellClick = (rowIdx: number, colIdx: number) => {
        if (mode !== 'edit') return;

        if (wallMode === 'thin-v') {
            if (colIdx < gridSize - 1) {
                setThinWalls(prev => {
                    const exists = prev.vertical.some(([r, c]) => r === rowIdx && c === colIdx);
                    if (exists) {
                        return { ...prev, vertical: prev.vertical.filter(([r, c]) => !(r === rowIdx && c === colIdx)) };
                    } else {
                        return { ...prev, vertical: [...prev.vertical, [rowIdx, colIdx]] };
                    }
                });
            }
            return;
        }

        if (wallMode === 'thin-h') {
            if (rowIdx < gridSize - 1) {
                setThinWalls(prev => {
                    const exists = prev.horizontal.some(([r, c]) => r === rowIdx && c === colIdx);
                    if (exists) {
                        return { ...prev, horizontal: prev.horizontal.filter(([r, c]) => !(r === rowIdx && c === colIdx)) };
                    } else {
                        return { ...prev, horizontal: [...prev.horizontal, [rowIdx, colIdx]] };
                    }
                });
            }
            return;
        }

        const newGrid = grid.map(row => [...row]);
        let newValue: Cell;
        const currentCell = grid[rowIdx][colIdx];

        const getCurrentValue = (cell: Cell): number => {
            if (typeof cell === 'number') return cell;
            if (typeof cell === 'object' && cell !== null && 'value' in cell) return cell.value;
            return 0;
        };

        if (selectedTool.type === 'empty') {
            newValue = 0;
        } else if (selectedTool.type === 'number') {
            newValue = selectedTool.value || 0;
        } else if (selectedTool.type === 'wall') {
            newValue = WALL;
        } else if (selectedTool.type === 'mechanic') {
            const baseValue = getCurrentValue(currentCell);

            if (selectedTool.mechanic === 'locked') {
                newValue = { type: 'locked', value: baseValue };
            } else if (selectedTool.mechanic === 'generator') {
                newValue = { type: 'generator', value: baseValue };
            } else if (selectedTool.mechanic === 'sticky') {
                newValue = { type: 'sticky', value: baseValue };
            } else if (selectedTool.mechanic === 'temporary') {
                if (typeof currentCell === 'object' && currentCell !== null && (currentCell as any).type === 'temporary') {
                    const currentLimit = (currentCell as any).limit || 1;
                    const nextLimit = currentLimit >= 3 ? 1 : currentLimit + 1;
                    newValue = { type: 'temporary', value: baseValue, limit: nextLimit };
                } else {
                    newValue = { type: 'temporary', value: baseValue, limit: 1 };
                }
            } else {
                newValue = 0;
            }
        } else {
            newValue = 0;
        }

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
            thinWalls: thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0 ? thinWalls : undefined
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
            thinWalls: thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0 ? thinWalls : undefined
        };
        onPlayTest(level);
    };

    const clearGrid = () => {
        if (confirm('Clear entire grid?')) {
            setGrid(createEmptyGrid(gridSize));
            setThinWalls({ vertical: [], horizontal: [] });
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-4 shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 sm:gap-2 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    Back
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition ${showSettings ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={clearGrid}
                        className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300"
                        title="Clear Grid"
                    >
                        <Eraser size={20} />
                    </button>
                    <button
                        onClick={handlePlayTest}
                        className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition text-sm sm:text-base"
                    >
                        <Play size={18} />
                        <span className="hidden sm:inline">Test</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition text-sm sm:text-base"
                    >
                        <Save size={18} />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            {/* Settings Panel - Mobile Optimized */}
            {showSettings && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 border-2 border-slate-200 dark:border-slate-700 shrink-0 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3">Level Settings</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Grid Size</label>
                            <select
                                value={gridSize}
                                onChange={(e) => handleGridSizeChange(Number(e.target.value) as 3 | 4 | 5 | 6)}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm"
                            >
                                <option value={3}>3x3</option>
                                <option value={4}>4x4</option>
                                <option value={5}>5x5</option>
                                <option value={6}>6x6</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Target Value</label>
                            <select
                                value={targetValue}
                                onChange={(e) => setTargetValue(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm"
                            >
                                <optgroup label="Positive">
                                    {[2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Negative">
                                    {[-2, -4, -8, -16, -32, -64, -128, -256, -512, -1024, -2048].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Level Name</label>
                            <input
                                type="text"
                                value={levelName}
                                onChange={(e) => setLevelName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm"
                                placeholder="Level Name"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Description</label>
                            <input
                                type="text"
                                value={levelDescription}
                                onChange={(e) => setLevelDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm"
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Flex-col-reverse for mobile (Toolbox at bottom) */}
            {/* Main Content */}
            {/* CHANGE: 'overflow-hidden' -> 'overflow-y-auto md:overflow-hidden' to allow scrolling on small screens */}
            <div className="flex-1 flex flex-col-reverse md:flex-row gap-4 overflow-y-auto md:overflow-hidden pb-2">

                {/* Toolbox */}
                {/* CHANGE: Removed fixed h-64 constraint on mobile to let it fit content naturally if needed, 
                    but kept max-height/scroll logic for internal list */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border-2 border-slate-200 dark:border-slate-700 w-full md:w-80 flex-shrink-0 flex flex-col md:h-auto shrink-0">
                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-3 shrink-0">
                        {/* ... tabs code ... */}
                        <button onClick={() => setActiveCategory('tiles')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'tiles' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Tiles</button>
                        <button onClick={() => setActiveCategory('walls')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'walls' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Walls</button>
                        <button onClick={() => setActiveCategory('mechanics')} className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition ${activeCategory === 'mechanics' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Mechanics</button>
                    </div>

                    {/* Scrollable Tool List */}
                    {/* Added max-h-[30vh] on mobile to prevent toolbox from taking WHOLE screen, ensuring Grid is visible */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[25vh] md:max-h-none">
                        {/* ... tool list content ... */}
                        {activeCategory === 'tiles' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => { setSelectedTool(EMPTY_TOOL); setWallMode('tile'); }}
                                    className={`w-full p-3 rounded-lg border-2 transition font-semibold flex items-center gap-3 ${selectedTool.type === 'empty' && wallMode === 'tile' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <span className="text-2xl">⬜</span><span>Clear Cell</span>
                                </button>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Positive</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {POSITIVE_TILES.map((tool) => (
                                            <button
                                                key={tool.value}
                                                onClick={() => { setSelectedTool(tool); setWallMode('tile'); }}
                                                className={`p-2 rounded-lg border-2 transition ${selectedTool.type === 'number' && selectedTool.value === tool.value && wallMode === 'tile' ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800' : 'border-transparent hover:border-orange-300 dark:hover:border-orange-700'}`}
                                            >
                                                <MiniTile value={tool.value!} size="sm" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Negative</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {NEGATIVE_TILES.map((tool) => (
                                            <button
                                                key={tool.value}
                                                onClick={() => { setSelectedTool(tool); setWallMode('tile'); }}
                                                className={`p-2 rounded-lg border-2 transition ${selectedTool.type === 'number' && selectedTool.value === tool.value && wallMode === 'tile' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'}`}
                                            >
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
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (tool.label.includes('|')) { setWallMode('thin-v'); setSelectedTool(tool); }
                                            else if (tool.label.includes('—')) { setWallMode('thin-h'); setSelectedTool(tool); }
                                            else { setWallMode('tile'); setSelectedTool(tool); }
                                        }}
                                        className={`w-full p-3 rounded-xl border-2 transition font-semibold flex items-center gap-4 ${(tool.type === 'wall' && selectedTool.type === 'wall' && wallMode === 'tile') || (tool.label.includes('|') && wallMode === 'thin-v') || (tool.label.includes('—') && wallMode === 'thin-h') ? 'border-slate-700 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-inner' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm'}`}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600">
                                            {tool.label.includes('|') ? <div className="w-1.5 h-8 bg-slate-600 dark:bg-slate-400 rounded-full" /> :
                                                tool.label.includes('—') ? <div className="w-8 h-1.5 bg-slate-600 dark:bg-slate-400 rounded-full" /> :
                                                    <span className="text-2xl">{tool.icon}</span>}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">{tool.label.replace(' |', '').replace(' —', '')}</div>
                                            <div className="text-[10px] opacity-70 font-normal">{tool.label.includes('|') ? 'Right edge of cell' : tool.label.includes('—') ? 'Bottom edge of cell' : 'Fills entire cell'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeCategory === 'mechanics' && (
                            <div className="space-y-3">
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium flex gap-2">
                                        <Info size={14} className="flex-shrink-0 mt-0.5" />
                                        <span>Select a number first to fill the cell, then apply a mechanic.<br /><span className="opacity-75 italic mt-1 block">Tip: Click "Temporary" multiple times to increase the limit.</span></span>
                                    </p>
                                </div>
                                {MECHANIC_TOOLS.map((tool, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setWallMode('tile'); setSelectedTool(tool); }}
                                        className={`w-full p-4 rounded-lg border-2 transition font-semibold flex items-center gap-3 ${selectedTool.type === 'mechanic' && selectedTool.mechanic === tool.mechanic ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700'}`}
                                    >
                                        <span className="text-2xl">{tool.icon}</span>
                                        <div className="text-left">
                                            <div>{tool.label}</div>
                                            <div className="text-[10px] opacity-70">{tool.mechanic === 'locked' && 'Trap/Lock'}{tool.mechanic === 'generator' && 'Creates tiles'}{tool.mechanic === 'sticky' && 'Stops movement'}{tool.mechanic === 'temporary' && 'Crumbles after use'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Editor Area */}
                {/* CHANGE: Added 'min-h-[300px]' to prevent the grid from being squashed too small */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="bg-slate-300 dark:bg-slate-700 p-3 rounded-xl shadow-xl w-full max-w-[400px]">
                        <div
                            className="grid gap-2 sm:gap-3 relative mx-auto"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                                width: '100%',
                                aspectRatio: '1/1'
                            }}
                        >
                            {grid.map((row, rowIdx) =>
                                row.map((cell, colIdx) => (
                                    <button
                                        key={`${rowIdx}-${colIdx}`}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                        className="relative w-full h-full hover:ring-2 hover:ring-purple-400 rounded-lg transition active:scale-95"
                                    >
                                        <Tile value={cell} boardSize={gridSize} />
                                    </button>
                                ))
                            )}

                            {/* Thin Walls - Fixed Formula */}
                            {thinWalls.vertical.map(([r, c], i) => (
                                <div key={`v-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm pointer-events-none"
                                    style={{
                                        width: '6px',
                                        height: `calc(${100 / gridSize}% - ${1.25 * 0.75}rem)`,
                                        top: `calc(${r * 100 / gridSize}% + ${0.75}rem * (${r / gridSize} + 0.5))`,
                                        left: `calc(${(c + 1) * 100 / gridSize}% + ${0.75}rem * (${(c + 1) / gridSize} - 0.5) - 3px)`
                                    }} />
                            ))}
                            {thinWalls.horizontal.map(([r, c], i) => (
                                <div key={`h-${i}`} className="absolute bg-slate-800 dark:bg-slate-200 rounded-full z-10 shadow-sm pointer-events-none"
                                    style={{
                                        height: '6px',
                                        width: `calc(${100 / gridSize}% - ${0.75}rem)`,
                                        left: `calc(${c * 100 / gridSize}% + ${0.75}rem * (${c / gridSize} + 0.5))`,
                                        top: `calc(${(r + 1) * 100 / gridSize}% + ${0.75}rem * (${(r + 1) / gridSize} - 0.5) - 3px)`
                                    }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelEditorView;
