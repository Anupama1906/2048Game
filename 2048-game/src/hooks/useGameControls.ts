// src/hooks/useGameControls.ts
import { useKeyboardControls } from './useKeyboardControls';
import { useTouchGestures } from './useTouchGestures';
import type { Direction } from '../types/types';

export const useGameControls = (onMove: (dir: Direction) => void) => {
    useKeyboardControls(onMove);
    const touchHandlers = useTouchGestures(onMove);
    return touchHandlers;
};