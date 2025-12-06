// src/services/dailyService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Level } from '../types/types';
import type { CustomLevel } from '../types/editorTypes';
import { getDailyLevel as getFallbackDaily } from '../utils/daily';

const COLLECTION = 'daily_puzzles';

// Helper: Get date key "YYYY-MM-DD"
export const getDateKey = (dateObj: Date = new Date()): string => {
    return dateObj.toISOString().split('T')[0];
};

// Fetch Level: Cloud -> Fallback
export const fetchDailyLevel = async (dateStr?: string): Promise<Level> => {
    const targetDate = dateStr || getDateKey();

    try {
        // 1. Try fetching from Firestore
        const docRef = doc(db, COLLECTION, targetDate);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            console.log(`✨ Loaded daily level for ${targetDate} from Cloud`);

            // Parse grid if it was stored as a JSON string
            let gridData = data.grid;
            if (typeof gridData === 'string') {
                try { gridData = JSON.parse(gridData); } catch (e) { console.error("Grid parse error", e); }
            }

            return {
                id: `daily-${targetDate}`, // ID must match date for leaderboard
                name: data.name,
                description: data.description,
                target: data.target,
                grid: gridData,
                par: data.par || 10,
                thinWalls: data.thinWalls || undefined,
                section: 'Daily'
            } as Level;
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch cloud level, using fallback.', error);
    }

    // 2. Fallback to local pool
    console.log(`📱 Using local fallback for ${targetDate}`);
    return getFallbackDaily();
};

// Publish Level to Cloud
export const publishDailyLevel = async (level: CustomLevel, dateStr: string): Promise<void> => {
    const docRef = doc(db, COLLECTION, dateStr);

    // Ensure grid is clean data
    const cleanGrid = level.grid.map(row => row.map(cell => {
        // If your editor uses complex objects that shouldn't be saved directly, clean them here.
        // For now, assuming your LevelEditor outputs valid JSON-serializable cells.
        return cell;
    }));

    const storageData = {
        name: level.name,
        description: level.description,
        target: level.target,
        grid: JSON.stringify(cleanGrid), // Store as string to be safe with varied cell types
        thinWalls: level.thinWalls || null,
        par: level.par || 10,
        publishedAt: new Date().toISOString(),
        author: 'Dev'
    };

    await setDoc(docRef, storageData);
};