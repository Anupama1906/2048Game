// src/components/LevelEditor/index.tsx
import React, { useState, useEffect } from 'react';
import type { CustomLevel, EditorMode, EditorTool, TileCategory } from '../../types/editorTypes';
import type { Grid, Cell } from '../../types/types';
import { POSITIVE_TILES, WALL_TOOLS, MECHANIC_TOOLS, EMPTY_TOOL } from '../../types/editorTypes';
import { WALL } from '../../constants/game';
import { useAuth } from '../../contexts/AuthContext';
import { saveLevel, generateLevelId } from '../../services/customLevelsStorage';
import { createEmptyGrid } from '../../game/grid';
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
    }, [existingLevel]);

    // -- Handlers --

    // Smart Resizer (Rectangular Support)
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
            createdBy: username,
            createdAt: existingLevel?.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isVerified: existingLevel?.isVerified || false,
            thinWalls: (thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0) ? thinWalls : undefined
        };
        saveLevel(level);
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
            createdBy: username,
            createdAt: existingLevel?.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isVerified: false,
            thinWalls: (thinWalls.vertical.length > 0 || thinWalls.horizontal.length > 0) ? thinWalls : undefined
        };
        onPlayTest(level);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <EditorHeader
                title="Level Editor"
                subtitle={saveMode === 'export' ? "Editing Daily Level (Dev)" : (existingLevel ? "Editing" : "Creating")}
                saveMode={saveMode}
                copiedCode={copiedCode}
                onBack={onBack}
                onSettings={() => setShowProperties(true)}
                onClear={() => { if (confirm('Clear grid?')) setGrid(createEmptyGrid(rows, cols)); }}
                onTest={handlePlayTest}
                onSave={handleSave}
            />

            {/* Main Content: Flex-col-reverse for mobile (Grid on top, Tools bottom) */}
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
                onTargetChange={setTargetValue}
                onNameChange={setLevelName}
                onDescriptionChange={setLevelDescription}
            />
        </div>
    );
};

export default LevelEditorView;