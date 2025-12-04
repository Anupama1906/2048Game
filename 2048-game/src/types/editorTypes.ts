// src/types/editorTypes.ts
import type { Cell, Level } from './types';

export interface CustomLevel extends Level {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    isVerified: boolean;
    shareCode?: string;    // NEW
    sharedAt?: string;     // NEW
    plays?: number;        // NEW
    likes?: number;        // NEW
}

export type EditorMode = 'edit' | 'play';

export type TileCategory = 'tiles' | 'walls' | 'mechanics';

export interface EditorTool {
    category: TileCategory;
    type: 'number' | 'wall' | 'thin-wall' | 'mechanic' | 'empty';
    value?: number; // for numbered tiles
    mechanic?: 'locked' | 'generator' | 'sticky' | 'temporary';
    label: string;
    icon?: string;
}

// Positive tiles
export const POSITIVE_TILES: EditorTool[] = [
    { category: 'tiles', type: 'number', value: 2, label: '2' },
    { category: 'tiles', type: 'number', value: 4, label: '4' },
    { category: 'tiles', type: 'number', value: 8, label: '8' },
    { category: 'tiles', type: 'number', value: 16, label: '16' },
    { category: 'tiles', type: 'number', value: 32, label: '32' },
    { category: 'tiles', type: 'number', value: 64, label: '64' },
    { category: 'tiles', type: 'number', value: 128, label: '128' },
    { category: 'tiles', type: 'number', value: 256, label: '256' },
    { category: 'tiles', type: 'number', value: 512, label: '512' },
    { category: 'tiles', type: 'number', value: 1024, label: '1024' },
    { category: 'tiles', type: 'number', value: 2048, label: '2048' }
];

// Negative tiles
export const NEGATIVE_TILES: EditorTool[] = [
    { category: 'tiles', type: 'number', value: -2, label: '-2' },
    { category: 'tiles', type: 'number', value: -4, label: '-4' },
    { category: 'tiles', type: 'number', value: -8, label: '-8' },
    { category: 'tiles', type: 'number', value: -16, label: '-16' },
    { category: 'tiles', type: 'number', value: -32, label: '-32' },
    { category: 'tiles', type: 'number', value: -64, label: '-64' },
    { category: 'tiles', type: 'number', value: -128, label: '-128' },
    { category: 'tiles', type: 'number', value: -256, label: '-256' },
    { category: 'tiles', type: 'number', value: -512, label: '-512' },
    { category: 'tiles', type: 'number', value: -1024, label: '-1024' },
    { category: 'tiles', type: 'number', value: -2048, label: '-2048' }
];

// Walls
export const WALL_TOOLS: EditorTool[] = [
    { category: 'walls', type: 'wall', label: 'Block Wall', icon: '🧱' },
    { category: 'walls', type: 'thin-wall', label: 'Thin Wall |', icon: '|' },
    { category: 'walls', type: 'thin-wall', label: 'Thin Wall —', icon: '—' }
];

// Mechanics
export const MECHANIC_TOOLS: EditorTool[] = [
    { category: 'mechanics', type: 'mechanic', mechanic: 'locked', label: 'Locked', icon: '🔒' },
    { category: 'mechanics', type: 'mechanic', mechanic: 'generator', label: 'Generator', icon: '🏭' },
    { category: 'mechanics', type: 'mechanic', mechanic: 'sticky', label: 'Sticky', icon: '🧲' },
    { category: 'mechanics', type: 'mechanic', mechanic: 'temporary', label: 'Temporary', icon: '⏳' }
];
// Empty/Clear tool
export const EMPTY_TOOL: EditorTool = { category: 'tiles', type: 'empty', label: 'Clear', icon: '⬜' };