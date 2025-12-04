// src/hooks/useKeyboardControls.ts
import { useEffect, useRef, useCallback } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const useKeyboardControls = (
    onMove: (direction: Direction) => void,
    moveDelay: number = 100
) => {
    const lastMoveTime = useRef(0);

    const throttledMove = useCallback((direction: Direction) => {
        const now = Date.now();
        if (now - lastMoveTime.current < moveDelay) return;
        lastMoveTime.current = now;
        onMove(direction);
    }, [onMove, moveDelay]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                    throttledMove('UP');
                    break;
                case 'ArrowDown':
                    throttledMove('DOWN');
                    break;
                case 'ArrowLeft':
                    throttledMove('LEFT');
                    break;
                case 'ArrowRight':
                    throttledMove('RIGHT');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [throttledMove]);
};