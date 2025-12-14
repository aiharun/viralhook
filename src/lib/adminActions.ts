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
    username: string | null;
    isPro: boolean;
    isAdmin: boolean;
    isOnline: boolean;
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

// Super admin email - only this user can assign admin roles
const SUPER_ADMIN_EMAIL = "widrivite@gmail.com";

/**
 * Toggle user's Admin status (only super admin can do this)
 */
export async function toggleAdminStatus(userId: string, requestingUserEmail: string): Promise<void> {
    // Only super admin can assign admin roles
    if (requestingUserEmail !== SUPER_ADMIN_EMAIL) {
        throw new Error("Sadece süper admin bu işlemi yapabilir");
    }

    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const currentAdminStatus = userDoc.data().isAdmin || false;

        await updateDoc(userRef, {
            isAdmin: !currentAdminStatus,
            lastActivity: new Date().toISOString(),
        });

        console.log(`✅ User ${userId} Admin status: ${currentAdminStatus} → ${!currentAdminStatus}`);
    } catch (error) {
        console.error("Error toggling Admin status:", error);
        throw error;
    }
}

/**
 * Delete user account (from Firestore and Firebase Auth)
 */
export async function deleteUserAccount(userId: string, adminEmail: string): Promise<void> {
    try {
        // First, call API to delete from Firebase Auth
        const response = await fetch("/api/admin/delete-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, adminEmail }),
        });

        if (!response.ok) {
            const data = await response.json();
            console.warn("Auth deletion warning:", data.error);
            // Continue with Firestore deletion even if Auth fails
        }

        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", userId));

        console.log(`🗑️ User ${userId} fully deleted`);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

/**
 * Create new user account (calls API)
 */
export async function createUser(data: any, adminEmail: string): Promise<void> {
    const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, adminEmail })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
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
    // Super admin email (only this user can assign admin roles)
    const SUPER_ADMIN_EMAIL = "widrivite@gmail.com";

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const users: UserStats[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Skip super admin from list
            if (data.email === SUPER_ADMIN_EMAIL) {
                return;
            }
            users.push({
                id: doc.id,
                email: data.email || null,
                username: data.username || data.displayUsername || null,
                isPro: data.isPro || false,
                isAdmin: data.isAdmin || false,
                isOnline: data.isOnline || false,
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
