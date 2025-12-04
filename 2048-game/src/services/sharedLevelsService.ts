// src/services/sharedLevelsService.ts
import { db } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    deleteDoc
} from 'firebase/firestore';
import type { CustomLevel } from '../types/editorTypes';

// Generate a unique 6-character code
export const generateShareCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

// Check if code already exists
const checkCodeExists = async (code: string): Promise<boolean> => {
    const levelRef = doc(db, 'sharedLevels', code);
    const levelDoc = await getDoc(levelRef);
    return levelDoc.exists();
};

// Helper function to deserialize levels
const deserializeLevel = (data: any): CustomLevel => {
    const deserializeCell = (cell: any) => {
        if (typeof cell === 'object' && cell !== null && cell._type === 'object') {
            const { _type, ...rest } = cell;
            return rest;
        }
        return cell;
    };

    let rawGrid = data.grid;
    if (typeof rawGrid === 'string') {
        try {
            rawGrid = JSON.parse(rawGrid);
        } catch (e) {
            console.error('Failed to parse grid JSON:', e);
            rawGrid = [];
        }
    }

    const deserializedGrid = Array.isArray(rawGrid)
        ? rawGrid.map((row: any[]) => row.map((cell: any) => deserializeCell(cell)))
        : [];

    let thinWalls = data.thinWalls;
    if (typeof thinWalls === 'string') {
        try {
            thinWalls = JSON.parse(thinWalls);
        } catch (e) {
            console.error('Failed to parse thinWalls JSON:', e);
            thinWalls = undefined;
        }
    }

    return {
        ...data,
        grid: deserializedGrid,
        thinWalls: thinWalls
    } as CustomLevel;
};

// Check if this level was previously shared
const findExistingSharedLevel = async (levelId: string | number): Promise<string | null> => {
    const levelsRef = collection(db, 'sharedLevels');
    const q = query(levelsRef, where('id', '==', levelId));

    try {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].data().shareCode;
        }
    } catch (error) {
        console.error('Error checking for existing shared level:', error);
    }

    return null;
};

// Delete old shared version (Internal helper if needed, currently unused but good to keep)
const deleteSharedLevel = async (shareCode: string): Promise<void> => {
    try {
        const levelRef = doc(db, 'sharedLevels', shareCode);
        await deleteDoc(levelRef);
        console.log('🗑️ Deleted old shared level:', shareCode);
    } catch (error) {
        console.error('Error deleting shared level:', error);
    }
};

// Share a level to Firebase (updated to replace existing)
export const shareLevel = async (level: CustomLevel): Promise<string> => {
    if (!level.isVerified) {
        throw new Error('Only verified levels can be shared');
    }

    // Check if this level was already shared before
    const existingShareCode = await findExistingSharedLevel(level.id);

    let shareCode: string;

    if (existingShareCode) {
        // Re-use the same share code for updates
        shareCode = existingShareCode;
        console.log('♻️ Updating existing shared level:', shareCode);
    } else {
        // Generate new unique code
        shareCode = generateShareCode();
        let attempts = 0;

        while (attempts < 5) {
            const exists = await checkCodeExists(shareCode);
            if (!exists) break;
            shareCode = generateShareCode();
            attempts++;
        }

        if (attempts >= 5) {
            throw new Error('Failed to generate unique code. Please try again.');
        }
    }

    // Convert grid to Firebase-safe format
    const serializeCell = (cell: any) => {
        if (typeof cell === 'object' && cell !== null && cell !== 'WALL') {
            return { _type: 'object', ...cell };
        }
        return cell;
    };

    const serializedGrid = level.grid.map(row =>
        row.map(cell => serializeCell(cell))
    );

    // Prepare level data for sharing
    const sharedLevel = {
        id: level.id,
        name: level.name,
        description: level.description,
        target: level.target,
        grid: JSON.stringify(serializedGrid),
        thinWalls: level.thinWalls ? JSON.stringify(level.thinWalls) : null,
        section: level.section || 'Custom',
        par: level.par || null,
        createdBy: level.createdBy,
        createdAt: level.createdAt,
        lastModified: level.lastModified,
        isVerified: level.isVerified,
        shareCode,
        sharedAt: new Date().toISOString(),
        plays: existingShareCode ? (await getDoc(doc(db, 'sharedLevels', existingShareCode))).data()?.plays || 0 : 0, // Preserve play count
        likes: 0
    };

    // Save to Firebase (overwrites if exists)
    const levelRef = doc(db, 'sharedLevels', shareCode);
    await setDoc(levelRef, sharedLevel);

    return shareCode;
};

// Load a level by share code
export const loadSharedLevel = async (shareCode: string): Promise<CustomLevel | null> => {
    const normalizedCode = shareCode.toUpperCase().trim();
    const levelRef = doc(db, 'sharedLevels', normalizedCode);
    const levelDoc = await getDoc(levelRef);

    if (!levelDoc.exists()) {
        return null;
    }

    return deserializeLevel(levelDoc.data());
};

// Get popular shared levels
export const getPopularLevels = async (limitCount: number = 20): Promise<CustomLevel[]> => {
    const levelsRef = collection(db, 'sharedLevels');
    const q = query(
        levelsRef,
        orderBy('plays', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => deserializeLevel(doc.data()));
};

// Get recent shared levels
export const getRecentLevels = async (limitCount: number = 20): Promise<CustomLevel[]> => {
    const levelsRef = collection(db, 'sharedLevels');
    const q = query(
        levelsRef,
        orderBy('sharedAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => deserializeLevel(doc.data()));
};

// Increment play count
export const incrementPlayCount = async (shareCode: string): Promise<void> => {
    const levelRef = doc(db, 'sharedLevels', shareCode);
    const levelDoc = await getDoc(levelRef);

    if (levelDoc.exists()) {
        const currentPlays = levelDoc.data().plays || 0;
        await setDoc(levelRef, { plays: currentPlays + 1 }, { merge: true });
    }
};

// Get levels by creator
export const getLevelsByCreator = async (username: string): Promise<CustomLevel[]> => {
    const levelsRef = collection(db, 'sharedLevels');
    const q = query(
        levelsRef,
        where('createdBy', '==', username),
        orderBy('sharedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => deserializeLevel(doc.data()));
};

// --- NEW: Recently Played Local Storage Logic ---
const RECENTLY_PLAYED_KEY = 'target2048_recently_played';

export const saveRecentlyPlayed = (level: CustomLevel): void => {
    if (!level.shareCode) return;
    try {
        const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
        let codes: string[] = stored ? JSON.parse(stored) : [];

        // Remove if exists (to move to top)
        codes = codes.filter(c => c !== level.shareCode);

        // Add to front
        codes.unshift(level.shareCode);

        // Limit to 20
        if (codes.length > 20) codes = codes.slice(0, 20);

        localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(codes));
    } catch (e) {
        console.error('Failed to save recently played:', e);
    }
};

export const getRecentlyPlayedLevels = async (): Promise<CustomLevel[]> => {
    try {
        const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
        const codes: string[] = stored ? JSON.parse(stored) : [];

        if (codes.length === 0) return [];

        // Fetch all levels in parallel
        const promises = codes.map(code => loadSharedLevel(code));
        const results = await Promise.all(promises);

        // Filter out any nulls (deleted levels)
        return results.filter((l): l is CustomLevel => l !== null);
    } catch (e) {
        console.error('Failed to load recently played levels:', e);
        return [];
    }
};