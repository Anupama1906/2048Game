// src/components/LevelEditor/LevelEditorView.tsx
import React, { useState, useEffect } from 'react';
import type { CustomLevel, EditorMode, EditorTool, TileCategory } from '../../types/editorTypes';
import type { Grid, Cell } from '../../types/types';
import { POSITIVE_TILES, WALL_TOOLS, MECHANIC_TOOLS, EMPTY_TOOL } from '../../types/editorTypes';
import { WALL } from '../../constants/game';
import { useAuth } from '../../contexts/AuthContext';
import { saveLevel, generateLevelId } from '../../services/customLevelsStorage';
import { createEmptyGrid } from '../../game/grid';
import { AlertTriangle } from 'lucide-react'; // Added icon
import { Modal } from '../shared/Modal'; // Added Modal

// Sub-components
import { EditorHeader } from './EditorHeader';
import { EditorToolbox } from './EditorToolbox';
import { EditorGrid } from './EditorGrid';
import { LevelPropertiesModal } from './LevelPropertiesModal';

interface LevelEditorViewProps {
    existingLevel?: CustomLevel | null;
    onBack: () => void;
    onPlayTest: (level: CustomLevel) => void;
    saveMode?: 'local' | 'export';
}

const LevelEditorView: React.FC<LevelEditorViewProps> = ({
    existingLevel,
    onBack,
    onPlayTest,
    saveMode = 'local'
}) => {
    const { userId, username } = useAuth();

    // -- State --
    const [mode, setMode] = useState<EditorMode>('edit');
    const [selectedTool, setSelectedTool] = useState<EditorTool>(EMPTY_TOOL);

    // Grid Dimensions & Content
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(4);
    const [grid, setGrid] = useState<Grid>(createEmptyGrid(4, 4));

    // Level Metadata
    const [levelName, setLevelName] = useState('My Level');
    const [levelDescription, setLevelDescription] = useState('');
    const [targetValue, setTargetValue] = useState(64);

    // Walls & UI
    const [thinWalls, setThinWalls] = useState<{ vertical: [number, number][]; horizontal: [number, number][]; }>({ vertical: [], horizontal: [] });
    const [wallMode, setWallMode] = useState<'tile' | 'thin-v' | 'thin-h'>('tile');
    const [activeCategory, setActiveCategory] = useState<TileCategory>('tiles');

    // Modal State
    const [showProperties, setShowProperties] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Dirty State Tracking
    const [isDirty, setIsDirty] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    // -- Initialization --
    useEffect(() => {
        if (existingLevel) {
            const lGrid = existingLevel.grid as Grid;
            const lRows = lGrid.length;
            const lCols = lGrid[0]?.length || 4;

            setRows(lRows);
            setCols(lCols);
            setGrid(lGrid);
            setLevelName(existingLevel.name);
            setLevelDescription(existingLevel.description);
            setTargetValue(existingLevel.target);
            if (existingLevel.thinWalls) setThinWalls(existingLevel.thinWalls);
        } else {
            setGrid(createEmptyGrid(4, 4));
            setRows(4);
            setCols(4);
            setShowProperties(true);
        }
        setIsDirty(false); // Reset dirty flag on load
    }, [existingLevel]);

    // -- Handlers --

    const handleDimensionsChange = (newRows: number, newCols: number) => {
        if (newRows === rows && newCols === cols) return;

        const newGrid = Array(newRows).fill(null).map((_, r) =>
            Array(newCols).fill(null).map((_, c) => {
                if (r < grid.length && c < grid[0].length) return grid[r][c];
                return 0;
            })
        );

        const newVertical = thinWalls.vertical.filter(([r, c]) => r < newRows && c < newCols - 1);
        const newHorizontal = thinWalls.horizontal.filter(([r, c]) => r < newRows - 1 && c < newCols);

        setRows(newRows);
        setCols(newCols);
        setGrid(newGrid);
        setThinWalls({ vertical: newVertical, horizontal: newHorizontal });
        setIsDirty(true);
    };

    const handleCategoryChange = (category: TileCategory) => {
        setActiveCategory(category);
        if (category === 'tiles') setSelectedTool(POSITIVE_TILES[0]);
        else if (category === 'walls') { setSelectedTool(WALL_TOOLS[0]); setWallMode('tile'); }
        else if (category === 'mechanics') setSelectedTool(MECHANIC_TOOLS[0]);
    };

    const handleToolSelect = (tool: EditorTool, mode: 'tile' | 'thin-v' | 'thin-h' = 'tile') => {
        setSelectedTool(tool);
        setWallMode(mode);
    };

    const handleCellClick = (r: number, c: number) => {
        if (mode !== 'edit') return;

        setIsDirty(true); // Mark as modified

        // Thin Walls
        if (wallMode === 'thin-v') {
            if (c < cols - 1) {
                setThinWalls(prev => {
                    const exists = prev.vertical.some(([wr, wc]) => wr === r && wc === c);
                    return { ...prev, vertical: exists ? prev.vertical.filter(([wr, wc]) => !(wr === r && wc === c)) : [...prev.vertical, [r, c]] };
                });
            }
            return;
        }
        if (wallMode === 'thin-h') {
            if (r < rows - 1) {
                setThinWalls(prev => {
                    const exists = prev.horizontal.some(([wr, wc]) => wr === r && wc === c);
                    return { ...prev, horizontal: exists ? prev.horizontal.filter(([wr, wc]) => !(wr === r && wc === c)) : [...prev.horizontal, [r, c]] };
                });
            }
            return;
        }

        // Standard Cell
        const newGrid = grid.map(row => [...row]);
        let newValue: Cell = 0;
        const currentCell = grid[r][c];
        const baseValue = typeof currentCell === 'object' && currentCell !== null && 'value' in currentCell ? (currentCell as any).value : (typeof currentCell === 'number' ? currentCell : 0);

        if (selectedTool.type === 'number') newValue = selectedTool.value || 0;
        else if (selectedTool.type === 'wall') newValue = WALL;
        else if (selectedTool.type === 'mechanic') {
            if (selectedTool.mechanic === 'locked') newValue = { type: 'locked', value: baseValue };
            else if (selectedTool.mechanic === 'generator') newValue = { type: 'generator', value: baseValue };
            else if (selectedTool.mechanic === 'sticky') newValue = { type: 'sticky', value: baseValue };
            else if (selectedTool.mechanic === 'temporary') {
                const limit = (typeof currentCell === 'object' && (currentCell as any).type === 'temporary') ? (((currentCell as any).limit || 1) % 3) + 1 : 1;
                newValue = { type: 'temporary', value: baseValue, limit };
            }
        }

        newGrid[r][c] = newValue;
        setGrid(newGrid);
    };

    const generateLevelCode = () => {
        const gridString = grid.map(row => {
            const cells = row.map(cell => {
                if (cell === 0) return '0';
                if (cell === WALL) return "'W'";
                if (typeof cell === 'number') return cell;
                if (cell.type === 'locked') return `L(${cell.value})`;
                if (cell.type === 'generator') return `G(${cell.value})`;
                if (cell.type === 'sticky') return `S(${cell.value})`;
                if (cell.type === 'temporary') return `T(${cell.limit}, ${cell.value})`;
                return '0';
            }).join(', ');
            return `        [${cells}]`;
        }).join(',\n');

        let thinWallsStr = '';
        if (thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0) {
            thinWallsStr = `,\n        thinWalls: {\n            vertical: ${JSON.stringify(thinWalls.vertical)},\n            horizontal: ${JSON.stringify(thinWalls.horizontal)}\n        }`;
        }

        const codeId = existingLevel?.id || `daily-${Math.floor(Math.random() * 100)}`;

        return `    {
        id: '${codeId}',
        target: ${targetValue},
        name: "${levelName}",
        description: "${levelDescription || 'No description'}",
        par: 10,
        grid: [
${gridString}
        ]${thinWallsStr}
    },`;
    };

    const handleSave = () => {
        if (saveMode === 'export') {
            const code = generateLevelCode();
            navigator.clipboard.writeText(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 3000);
            return;
        }

        if (!userId || !username) return;
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
        setIsDirty(false); // Clear dirty flag
        onBack();
    };

    const handlePlayTest = () => {
        if (!userId || !username) return;
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

    // Intercept Back Button
    const handleBackRequest = () => {
        if (isDirty && saveMode === 'local') {
            setShowExitModal(true);
        } else {
            onBack();
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <EditorHeader
                title="Level Editor"
                subtitle={saveMode === 'export' ? "Editing Daily Level (Dev)" : (existingLevel ? "Editing" : "Creating")}
                saveMode={saveMode}
                copiedCode={copiedCode}
                onBack={handleBackRequest} // Use interceptor
                onSettings={() => setShowProperties(true)}
                onClear={() => { if (confirm('Clear grid?')) { setGrid(createEmptyGrid(rows, cols)); setIsDirty(true); } }}
                onTest={handlePlayTest}
                onSave={handleSave}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col-reverse md:flex-row gap-4 overflow-y-auto md:overflow-hidden pb-4 custom-scrollbar">

                <EditorToolbox
                    activeCategory={activeCategory}
                    selectedTool={selectedTool}
                    wallMode={wallMode}
                    onCategoryChange={handleCategoryChange}
                    onToolSelect={handleToolSelect}
                />

                <EditorGrid
                    grid={grid}
                    rows={rows}
                    cols={cols}
                    thinWalls={thinWalls}
                    selectedTool={selectedTool}
                    onCellClick={handleCellClick}
                />
            </div>

            <LevelPropertiesModal
                isOpen={showProperties}
                onClose={() => setShowProperties(false)}
                rows={rows}
                cols={cols}
                targetValue={targetValue}
                levelName={levelName}
                levelDescription={levelDescription}
                onRowsChange={(r) => handleDimensionsChange(r, cols)}
                onColsChange={(c) => handleDimensionsChange(rows, c)}
                onTargetChange={(v) => { setTargetValue(v); setIsDirty(true); }}
                onNameChange={(v) => { setLevelName(v); setIsDirty(true); }}
                onDescriptionChange={(v) => { setLevelDescription(v); setIsDirty(true); }}
            />

            {/* Exit Confirmation Modal */}
            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                title="Unsaved Changes"
                icon={AlertTriangle}
                iconColor="text-orange-500"
                maxWidth="sm"
            >
                <div className="p-4">
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        You have unsaved changes. Do you want to save your level before leaving?
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                        >
                            Save & Exit
                        </button>
                        <button
                            onClick={() => { setShowExitModal(false); onBack(); }}
                            className="w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-bold transition"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LevelEditorView;