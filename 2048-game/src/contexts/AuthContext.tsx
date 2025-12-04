// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    userId: string | null;
    username: string | null;
    loading: boolean;
    setUsername: (name: string) => Promise<void>;
    ensureSignedIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsernameState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Auto sign-in on first load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User exists
                setUser(firebaseUser);

                // Try to load username from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUsernameState(userDoc.data().username || null);
                }
            } else {
                // No user - auto sign in anonymously
                try {
                    await signInAnonymously(auth);
                    // The auth state change will trigger again with the new user
                } catch (error) {
                    console.error('Auto sign-in failed:', error);
                }
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const ensureSignedIn = async () => {
        if (!user) {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error('Sign in error:', error);
                throw error;
            }
        }
    };

    const setUsername = async (name: string) => {
        if (!user) throw new Error('No user logged in');

        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: name,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        }, { merge: true });

        setUsernameState(name);
    };

    return (
        <AuthContext.Provider value={{ user, userId: user?.uid || null, username, loading, setUsername, ensureSignedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
