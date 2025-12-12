import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Daily generation limits
 */
export const GENERATION_LIMITS = {
    FREE: 3,
    PRO: 100,
} as const;

/**
 * Check if user has exceeded daily generation limit
 * @returns true if user can generate, false if limit exceeded
 */
export async function checkGenerationLimit(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    isPro: boolean;
}> {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // New user - allow generation
            return {
                allowed: true,
                remaining: GENERATION_LIMITS.FREE,
                isPro: false,
            };
        }

        const data = userDoc.data();
        const isPro = data.isPro || false;
        const limit = isPro ? GENERATION_LIMITS.PRO : GENERATION_LIMITS.FREE;
        const used = data.generationsToday || 0;
        const remaining = Math.max(0, limit - used);

        return {
            allowed: remaining > 0,
            remaining,
            isPro,
        };
    } catch (error) {
        console.error("Error checking generation limit:", error);
        // On error, allow generation to not block users
        return {
            allowed: true,
            remaining: GENERATION_LIMITS.FREE,
            isPro: false,
        };
    }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}
