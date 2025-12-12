"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const MAX_FREE_GENERATIONS = 3;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    generationsToday: number;
    isAdmin: boolean;
    isPro: boolean;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    incrementGenerations: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin emails
const ADMIN_EMAILS = [
    "widrivite@gmail.com",
];

function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [generationsToday, setGenerationsToday] = useState(0);
    const [isPro, setIsPro] = useState(false);

    // Check if user is admin
    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await loadUserGenerations(currentUser.uid);
            } else {
                setGenerationsToday(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loadUserGenerations = async (userId: string) => {
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            const today = getTodayDate();

            if (userDoc.exists()) {
                const data = userDoc.data();
                const lastDate = data.lastGenerationDate || "";
                setIsPro(data.isPro || false);

                if (lastDate === today) {
                    setGenerationsToday(data.generationsToday || 0);
                } else {
                    // Reset for new day
                    await updateDoc(userRef, {
                        generationsToday: 0,
                        creditsRemaining: MAX_FREE_GENERATIONS,
                        lastGenerationDate: today,
                        lastVisit: new Date().toISOString(),
                    });
                    setGenerationsToday(0);
                }
            } else {
                // Create new user document
                await setDoc(userRef, {
                    email: auth.currentUser?.email || null, // Get from Firebase Auth
                    createdAt: new Date().toISOString(),
                    generationsToday: 0,
                    creditsRemaining: MAX_FREE_GENERATIONS,
                    generationsTotal: 0,
                    lastGenerationDate: today,
                    lastVisit: new Date().toISOString(),
                    isPro: false,
                });
                setGenerationsToday(0);
            }
        } catch (error) {
            console.error("Error loading user generations:", error);
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document with email
        const userRef = doc(db, "users", userCredential.user.uid);
        const today = getTodayDate();
        await setDoc(userRef, {
            email: email, // Save the email from registration
            createdAt: new Date().toISOString(),
            generationsToday: 0,
            creditsRemaining: MAX_FREE_GENERATIONS,
            generationsTotal: 0,
            lastGenerationDate: today,
            lastVisit: new Date().toISOString(),
            isPro: false,
        });
    };

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const handleSignOut = async () => {
        await firebaseSignOut(auth);
        setGenerationsToday(0);
    };

    const incrementGenerations = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const userRef = doc(db, "users", user.uid);
            const newCount = generationsToday + 1;

            await updateDoc(userRef, {
                generationsToday: newCount,
                creditsRemaining: MAX_FREE_GENERATIONS - newCount,
                lastGenerationDate: getTodayDate(),
                lastActivity: new Date().toISOString(),
            });

            setGenerationsToday(newCount);
            return true;
        } catch (error) {
            console.error("Error incrementing generations:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                generationsToday,
                isAdmin,
                isPro,
                signUpWithEmail,
                signInWithEmail,
                signOut: handleSignOut,
                incrementGenerations,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
