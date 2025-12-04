// src/hooks/useTouchGestures.ts
import { useRef, useCallback } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface TouchHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
}

export const useTouchGestures = (
    onSwipe: (direction: Direction) => void,
    minDistance: number = 30
): TouchHandlers => {
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const touchEnd = useRef<{ x: number; y: number } | null>(null);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        touchEnd.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart.current || !touchEnd.current) return;

        const dx = touchStart.current.x - touchEnd.current.x;
        const dy = touchStart.current.y - touchEnd.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            onSwipe(dx > 0 ? 'LEFT' : 'RIGHT');
        } else {
            onSwipe(dy > 0 ? 'UP' : 'DOWN');
        }
    }, [onSwipe, minDistance]);

    return { onTouchStart, onTouchMove, onTouchEnd };
};