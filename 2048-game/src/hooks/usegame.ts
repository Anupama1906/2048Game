import { useState, useEffect, useCallback } from 'react';
import type { Level, Grid, GameState, Direction } from '../types/types';
import { WALL } from '../constants/game';
import * as Engine from '../game/engine';
import { getCellValue } from '../game/mechanics';

export const useGame = (level: Level) => {
    const [grid, setGrid] = useState<Grid>([]);
    const [history, setHistory] = useState<Grid[]>([]);
    const [gameState, setGameState] = useState<GameState>('playing');

    // Initialize
    useEffect(() => {
        // Convert 'W' strings to numeric constants if needed
        const initialGrid: Grid = level.grid.map(row =>
            row.map(cell => (cell === 'W' || cell === 'WALL') ? WALL : cell)
        );
        setGrid(initialGrid);
        setHistory([]);
        setGameState('playing');
    }, [level]);

    const move = useCallback((direction: Direction) => {
        if (gameState !== 'playing') return;

        const result = Engine.moveGrid(grid, direction, level);

        if (result.moved) {
            setHistory(prev => [...prev, grid]); // Save old grid
            setGrid(result.grid);

            // Check Win/Loss conditions
            // 1. Check Win (Target reached)
            let hasWon = false;
            const allValues = result.grid.flat().map(c => getCellValue(c));

            if (allValues.some(v => v == level.target && v !== 0)) hasWon = true;

            if (hasWon) {
                setGameState('won');
                return;
            }

            // 2. Check Loss (No moves possible)
            // We pass the NEW grid to check if moves are possible from there
            if (!Engine.canMove(result.grid, level)) {
                setGameState('lost');
            }
        }
    }, [grid, gameState, level]);

    const undo = useCallback(() => {
        if (history.length === 0 || gameState === 'won') return;
        const previous = history[history.length - 1];
        setGrid(previous);
        setHistory(prev => prev.slice(0, -1));
        setGameState('playing');
    }, [history, gameState]);

    const reset = useCallback(() => {
        const initialGrid: Grid = level.grid.map(row =>
            row.map(cell => (cell === 'W' || cell === 'WALL') ? WALL : cell)
        );
        setGrid(initialGrid);
        setHistory([]);
        setGameState('playing');
    }, [level]);

    return {
        grid,
        gameState,
        history,
        moves: history.length,
        move,
        undo,
        reset,
        canUndo: history.length > 0
    };
};