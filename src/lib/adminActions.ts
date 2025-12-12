import { db } from "./firebase";
import {
    collection,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    limit as firestoreLimit
} from "firebase/firestore";

export interface UserStats {
    id: string;
    email: string | null;
    isPro: boolean;
    generationsToday: number;
    generationsTotal: number;
    createdAt: string;
    lastActivity: string;
}

export interface DashboardStats {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    totalGenerationsToday: number;
    totalGenerationsAllTime: number;
}

/**
 * Toggle user's Pro status
 */
export async function toggleUserPro(userId: string): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const currentProStatus = userDoc.data().isPro || false;

        await updateDoc(userRef, {
            isPro: !currentProStatus,
            lastActivity: new Date().toISOString(),
        });

        console.log(`✅ User ${userId} Pro status: ${currentProStatus} → ${!currentProStatus}`);
    } catch (error) {
        console.error("Error toggling Pro status:", error);
        throw error;
    }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: string): Promise<void> {
    try {
        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", userId));

        // Note: Firebase Auth user deletion requires Admin SDK (server-side)
        // For now, we only delete Firestore data

        console.log(`🗑️ User ${userId} deleted from Firestore`);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

/**
 * Reset user's daily generations
 */
export async function resetUserGenerations(userId: string): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
            generationsToday: 0,
            creditsRemaining: 3,
            lastActivity: new Date().toISOString(),
        });

        console.log(`🔄 User ${userId} generations reset`);
    } catch (error) {
        console.error("Error resetting generations:", error);
        throw error;
    }
}

/**
 * Get all users with stats
 */
export async function getAllUsers(): Promise<UserStats[]> {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const users: UserStats[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                email: data.email || null,
                isPro: data.isPro || false,
                generationsToday: data.generationsToday || 0,
                generationsTotal: data.generationsTotal || 0,
                createdAt: data.createdAt || "",
                lastActivity: data.lastActivity || data.createdAt || "",
            });
        });

        return users;
    } catch (error) {
        console.error("Error getting users:", error);
        throw error;
    }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const users = await getAllUsers();

        const stats: DashboardStats = {
            totalUsers: users.length,
            proUsers: users.filter(u => u.isPro).length,
            freeUsers: users.filter(u => !u.isPro).length,
            totalGenerationsToday: users.reduce((sum, u) => sum + u.generationsToday, 0),
            totalGenerationsAllTime: users.reduce((sum, u) => sum + u.generationsTotal, 0),
        };

        return stats;
    } catch (error) {
        console.error("Error getting stats:", error);
        throw error;
    }
}
