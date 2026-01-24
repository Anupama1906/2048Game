import { useState, useEffect, useRef, useCallback } from 'react';

export const useDailyTimer = (levelId: string | number, userUid: string | null) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Unique key for this user + level combination
    const storageKey = userUid ? `daily_progress_${userUid}_${levelId}` : null;

    // 1. Load saved time on mount
    useEffect(() => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Ensure we don't load corrupted data
                    if (typeof parsed.time === 'number') {
                        setTime(parsed.time);
                    }
                }
            } catch (e) {
                console.error('Failed to load daily progress', e);
            }
        }
    }, [storageKey]);

    // 2. Timer Interval Logic
    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - time * 1000;
            timerRef.current = window.setInterval(() => {
                setTime((Date.now() - startTime) / 1000);
            }, 100); // Update every 100ms
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    // 3. Save to Local Storage
    const saveProgress = useCallback(() => {
        if (storageKey && time > 0) {
            localStorage.setItem(storageKey, JSON.stringify({
                time,
                timestamp: Date.now()
            }));
        }
    }, [storageKey, time]);

    // Save automatically when pausing or unmounting
    useEffect(() => {
        const handleBeforeUnload = () => saveProgress();
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            saveProgress(); // Save on unmount
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveProgress]);

    const clearStorage = useCallback(() => {
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
    }, [storageKey]);

    return {
        time,
        setIsRunning,
        clearStorage,
        saveProgress
    };
};