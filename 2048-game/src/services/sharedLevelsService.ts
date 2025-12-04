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
    limit
} from 'firebase/firestore';
import type { CustomLevel } from '../types/editorTypes';

// Generate a unique 6-character code
export const generateShareCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous chars
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

    // 1. Handle stringified grid
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

    // 2. Handle stringified thinWalls [NEW FIX]
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

// Share a level to Firebase
export const shareLevel = async (level: CustomLevel): Promise<string> => {
    if (!level.isVerified) {
        throw new Error('Only verified levels can be shared');
    }

    // Generate unique code
    let shareCode = generateShareCode();
    let attempts = 0;

    // Ensure code is unique (max 5 attempts)
    while (attempts < 5) {
        const exists = await checkCodeExists(shareCode);
        if (!exists) break;
        shareCode = generateShareCode();
        attempts++;
    }

    if (attempts >= 5) {
        throw new Error('Failed to generate unique code. Please try again.');
    }

    // Convert grid to Firebase-safe format (serialize complex cells)
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
        // FIX 1: Stringify the grid
        grid: JSON.stringify(serializedGrid),
        // FIX 2: Stringify thinWalls if they exist (arrays of arrays cause error)
        thinWalls: level.thinWalls ? JSON.stringify(level.thinWalls) : null,
        section: level.section || 'Custom',
        par: level.par || null,
        createdBy: level.createdBy,
        createdAt: level.createdAt,
        lastModified: level.lastModified,
        isVerified: level.isVerified,
        shareCode,
        sharedAt: new Date().toISOString(),
        plays: 0,
        likes: 0
    };

    // Save to Firebase
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