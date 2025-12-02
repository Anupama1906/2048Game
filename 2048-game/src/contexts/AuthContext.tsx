// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    username: string | null;
    loading: boolean;
    setUsername: (name: string) => Promise<void>;
    signIn: () => Promise<void>;
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Load username from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUsernameState(userDoc.data().username);
                }
            } else {
                setUsernameState(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const setUsername = async (name: string) => {
        if (!user) throw new Error('No user logged in');

        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: name,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        });

        setUsernameState(name);
    };

    return (
        <AuthContext.Provider value={{ user, username, loading, setUsername, signIn }}>
            {children}
        </AuthContext.Provider>
    );
};