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
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export const MAX_FREE_GENERATIONS = 3;

interface AuthContextType {
    user: User | null;
    username: string | null;
    loading: boolean;
    generationsToday: number;
    isAdmin: boolean;
    isPro: boolean;
    signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
    signInWithEmailOrUsername: (emailOrUsername: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    incrementGenerations: () => Promise<boolean>;
    updateUsername: (newUsername: string) => Promise<void>;
    isUsernameAvailable: (username: string) => Promise<boolean>;
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
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generationsToday, setGenerationsToday] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await loadUserData(currentUser.uid);
            } else {
                setGenerationsToday(0);
                setUsername(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle tab close/browser close - set user offline
    useEffect(() => {
        if (!user) return;

        const setOffline = async () => {
            // Disabled immediate offline setting for 1 min delay requirement
            // We now rely on lastActivity timeout in the Admin Dashboard
            try {
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        lastActivity: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error("Error updating last activity:", error);
            }
        };

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden') {
                // Tab hidden - update activity but don't set offline immediately
                try {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        lastActivity: new Date().toISOString()
                    });
                } catch (error) {
                    console.error("Error updating visibility:", error);
                }
            } else if (document.visibilityState === 'visible') {
                // Tab visible again - mark as online
                try {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        isOnline: true,
                        lastActivity: new Date().toISOString()
                    });
                } catch (error) {
                    console.error("Error updating visibility:", error);
                }
            }
        };

        window.addEventListener('beforeunload', setOffline);
        window.addEventListener('pagehide', setOffline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Periodic heartbeat to keep lastActivity updated
        const heartbeat = setInterval(async () => {
            if (document.visibilityState === 'visible') {
                try {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        lastActivity: new Date().toISOString()
                    });
                } catch (error) {
                    console.error("Heartbeat error:", error);
                }
            }
        }, 60000); // Every 1 minute

        return () => {
            window.removeEventListener('beforeunload', setOffline);
            window.removeEventListener('pagehide', setOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(heartbeat);
        };
    }, [user]);

    const loadUserData = async (userId: string) => {
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            const today = getTodayDate();

            if (userDoc.exists()) {
                const data = userDoc.data();
                const lastDate = data.lastGenerationDate || "";
                setIsPro(data.isPro || false);
                // Check both username and displayUsername fields
                setUsername(data.username || data.displayUsername || null);

                // Check admin: from Firestore OR from ADMIN_EMAILS list
                const isAdminFromFirestore = data.isAdmin || false;
                const isAdminFromList = ADMIN_EMAILS.includes(data.email || "");
                setIsAdmin(isAdminFromFirestore || isAdminFromList);

                // Set user as online (for active tracking)
                await updateDoc(userRef, {
                    isOnline: true,
                    lastActivity: new Date().toISOString(),
                });

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
                    email: auth.currentUser?.email || null,
                    username: null,
                    createdAt: new Date().toISOString(),
                    generationsToday: 0,
                    creditsRemaining: MAX_FREE_GENERATIONS,
                    generationsTotal: 0,
                    lastGenerationDate: today,
                    lastVisit: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    isPro: false,
                });
                setGenerationsToday(0);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Check if username is available
    const isUsernameAvailable = async (username: string): Promise<boolean> => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username.toLowerCase()));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    };

    // Update username for current user
    const updateUsername = async (newUsername: string): Promise<void> => {
        if (!user) throw new Error("User not logged in");

        // Check availability
        const available = await isUsernameAvailable(newUsername);
        if (!available) {
            throw new Error("Bu kullanıcı adı zaten kullanılıyor");
        }

        // Update in Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            username: newUsername.toLowerCase(),
            displayUsername: newUsername,
        });

        setUsername(newUsername);
    };

    // Get email by username for login
    const getEmailByUsername = async (usernameInput: string): Promise<string | null> => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", usernameInput.toLowerCase()));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            return userData.email || null;
        }
        return null;
    };

    const signUpWithEmail = async (email: string, password: string, username: string) => {
        // Check username availability
        const available = await isUsernameAvailable(username);
        if (!available) {
            throw new Error("Bu kullanıcı adı zaten kullanılıyor");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document with username
        const userRef = doc(db, "users", userCredential.user.uid);
        const today = getTodayDate();
        await setDoc(userRef, {
            email: email,
            username: username.toLowerCase(),
            displayUsername: username, // Keep original casing for display
            createdAt: new Date().toISOString(),
            generationsToday: 0,
            creditsRemaining: MAX_FREE_GENERATIONS,
            generationsTotal: 0,
            lastGenerationDate: today,
            lastVisit: new Date().toISOString(),
            isPro: false,
        });

        setUsername(username);
    };

    const signInWithEmailOrUsername = async (emailOrUsername: string, password: string) => {
        let email = emailOrUsername;

        // If input doesn't look like an email, try to find email by username
        if (!emailOrUsername.includes("@")) {
            const foundEmail = await getEmailByUsername(emailOrUsername);
            if (!foundEmail) {
                throw new Error("Kullanıcı bulunamadı");
            }
            email = foundEmail;
        }

        await signInWithEmailAndPassword(auth, email, password);
    };

    const handleSignOut = async () => {
        // Set user as offline
        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    isOnline: false,
                });
            } catch (error) {
                console.error("Error updating isOnline on signout:", error);
            }
        }
        await firebaseSignOut(auth);
        setGenerationsToday(0);
        setUsername(null);
        setIsAdmin(false);
    };

    const incrementGenerations = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const currentTotal = userDoc.exists() ? (userDoc.data().generationsTotal || 0) : 0;
            const newCount = generationsToday + 1;

            await updateDoc(userRef, {
                generationsToday: newCount,
                generationsTotal: currentTotal + 1,
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
                username,
                loading,
                generationsToday,
                isAdmin,
                isPro,
                signUpWithEmail,
                signInWithEmailOrUsername,
                signOut: handleSignOut,
                incrementGenerations,
                updateUsername,
                isUsernameAvailable,
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
