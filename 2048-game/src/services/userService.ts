import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Check if a username is already taken by another user
export const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const snapshot = await getDocs(q);

        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};