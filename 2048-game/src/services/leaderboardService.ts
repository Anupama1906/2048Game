import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  getDoc
} from 'firebase/firestore';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  moves: number;
  time: number; // in seconds
  timestamp: string;
  score: number; // Calculated: lower is better
}

// Calculate score: prioritize moves, then time
export const calculateScore = (moves: number, time: number): number => {
  return moves * 1000 + time;
};


export const submitDailyScore = async (
  userId: string,
  username: string,
  levelId: string,
  moves: number,
  time: number
): Promise<void> => {
  const score = calculateScore(moves, time);

  const entry: LeaderboardEntry = {
    userId,
    username,
    moves,
    time,
    timestamp: new Date().toISOString(),
    score
  };

  // Use levelId as the document name (e.g., "daily-2024-12-02")
  const leaderboardRef = doc(db, 'leaderboards', levelId, 'entries', userId);

  await setDoc(leaderboardRef, entry);
};

// Get leaderboard for a specific daily level
export const getDailyLeaderboard = async (
  levelId: string,
  limitCount: number = 100
): Promise<LeaderboardEntry[]> => {
  const entriesRef = collection(db, 'leaderboards', levelId, 'entries');
  const q = query(entriesRef, orderBy('score', 'asc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
};

// Check if user has already submitted for this level
export const hasUserSubmitted = async (
  userId: string,
  levelId: string
): Promise<boolean> => {
  const entryRef = doc(db, 'leaderboards', levelId, 'entries', userId);
  const entryDoc = await getDoc(entryRef);
  return entryDoc.exists();
};

// Get user's rank for a specific level
export const getUserRank = async (
  userId: string,
  levelId: string
): Promise<number | null> => {
  const leaderboard = await getDailyLeaderboard(levelId, 1000);
  const index = leaderboard.findIndex(entry => entry.userId === userId);
  return index >= 0 ? index + 1 : null;
};

// Format time as MM:SS.ms
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};