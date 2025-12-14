import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

/**
 * POST /api/set-offline
 * Set user offline status when tab closes
 * Used with navigator.sendBeacon for reliable delivery
 */
export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isOnline: false,
            lastActivity: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error setting offline:", error);
        return NextResponse.json({ error: "Failed to set offline" }, { status: 500 });
    }
}
