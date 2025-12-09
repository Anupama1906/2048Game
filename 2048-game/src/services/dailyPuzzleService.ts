// src/services/dailyPuzzleService.ts
import { db } from '../config/firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import type { Level } from '../types/types';
import type { CustomLevel } from '../types/editorTypes';

const COLLECTION = 'daily_puzzles';
const CLEANUP_DAYS = 10;

// ========================================
// 🗓️ Date Utilities
// ========================================

export const getDateKey = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDate = (dateKey: string): Date => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// ========================================
// 🎯 Fetch Daily Puzzle
// ========================================

export const fetchDailyPuzzle = async (dateKey?: string): Promise<Level | null> => {
    const targetDate = dateKey || getDateKey();

    try {
        const docRef = doc(db, COLLECTION, targetDate);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            console.warn(`⚠️ No daily puzzle found for ${targetDate}`);
            return null;
        }

        const data = snapshot.data();

        // Parse grid if stored as JSON string
        let gridData = data.grid;
        if (typeof gridData === 'string') {
            try {
                gridData = JSON.parse(gridData);
            } catch (e) {
                console.error('Grid parse error:', e);
                return null;
            }
        }

        // Deserialize cells
        const deserializedGrid = gridData.map((row: any[]) =>
            row.map((cell: any) => {
                if (typeof cell === 'object' && cell !== null && cell._type === 'object') {
                    const { _type, ...rest } = cell;
                    return rest;
                }
                return cell;
            })
        );

        // Parse thin walls
        let thinWalls = data.thinWalls;
        if (typeof thinWalls === 'string') {
            try {
                thinWalls = JSON.parse(thinWalls);
            } catch (e) {
                thinWalls = undefined;
            }
        }

        console.log(`✨ Loaded daily puzzle for ${targetDate}`);

        return {
            id: `daily-${targetDate}`,
            name: data.name,
            description: data.description,
            target: data.target,
            grid: deserializedGrid,
            par: data.par || 10,
            thinWalls: thinWalls,
            section: 'Daily'
        } as Level;

    } catch (error) {
        console.error('Failed to fetch daily puzzle:', error);
        return null;
    }
};

// ========================================
// 📝 Publish Daily Puzzle
// ========================================

export const publishDailyPuzzle = async (
    level: CustomLevel | Level,
    dateKey: string
): Promise<void> => {
    const docRef = doc(db, COLLECTION, dateKey);

    // Serialize cells for Firebase storage
    const serializeCell = (cell: any) => {
        if (typeof cell === 'object' && cell !== null && cell !== 'WALL') {
            return { _type: 'object', ...cell };
        }
        return cell;
    };

    const serializedGrid = level.grid.map(row =>
        row.map(cell => serializeCell(cell))
    );

    const storageData = {
        name: level.name,
        description: level.description,
        target: level.target,
        grid: JSON.stringify(serializedGrid),
        thinWalls: level.thinWalls ? JSON.stringify(level.thinWalls) : null,
        par: level.par || 10,
        publishedAt: Timestamp.now(),
        releaseDate: dateKey,
        author: 'admin' // or pass userId if needed
    };

    await setDoc(docRef, storageData);
    console.log(`✅ Published daily puzzle for ${dateKey}`);
};

// ========================================
// 🗑️ Auto-Cleanup Old Puzzles
// ========================================

export const cleanupOldPuzzles = async (): Promise<void> => {
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);
    const cutoffKey = getDateKey(cutoffDate);

    try {
        const puzzlesRef = collection(db, COLLECTION);
        const q = query(puzzlesRef, where('releaseDate', '<', cutoffKey));

        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

        await Promise.all(deletePromises);

        if (snapshot.size > 0) {
            console.log(`🗑️ Cleaned up ${snapshot.size} old puzzles`);
        }
    } catch (error) {
        console.error('Failed to cleanup old puzzles:', error);
    }
};

// ========================================
// 🔍 Fetch Puzzle by Date (for DevPanel)
// ========================================

export const getPuzzleByDate = async (dateKey: string): Promise<Level | null> => {
    return await fetchDailyPuzzle(dateKey);
};

// ========================================
// 📅 Get All Scheduled Puzzles (for DevPanel)
// ========================================

export const getAllScheduledPuzzles = async (): Promise<Array<{ dateKey: string, name: string, target: number }>> => {
    try {
        const puzzlesRef = collection(db, COLLECTION);
        const snapshot = await getDocs(puzzlesRef);

        return snapshot.docs.map(doc => ({
            dateKey: doc.id,
            name: doc.data().name,
            target: doc.data().target
        })).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    } catch (error) {
        console.error('Failed to fetch scheduled puzzles:', error);
        return [];
    }
};

// ========================================
// ❌ Delete Puzzle (for DevPanel)
// ========================================

export const deleteDailyPuzzle = async (dateKey: string): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION, dateKey);
        await deleteDoc(docRef);
        console.log(`🗑️ Deleted puzzle for ${dateKey}`);
    } catch (error) {
        console.error('Failed to delete puzzle:', error);
        throw error;
    }
};

// ========================================
// 🔄 Check if Date has Puzzle
// ========================================

export const hasPuzzleForDate = async (dateKey: string): Promise<boolean> => {
    try {
        const docRef = doc(db, COLLECTION, dateKey);
        const snapshot = await getDoc(docRef);
        return snapshot.exists();
    } catch (error) {
        return false;
    }
};