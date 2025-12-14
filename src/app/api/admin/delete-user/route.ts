import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
    // Method 1: Individual environment variables (recommended)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log("✅ Firebase Admin initialized with individual credentials");
        } catch (error) {
            console.error("Failed to initialize Firebase Admin:", error);
        }
    } else {
        console.warn("⚠️ Firebase Admin not configured - missing credentials");
        console.warn("Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
    }
}

// Admin emails (same as in AuthContext)
const ADMIN_EMAILS = ["widrivite@gmail.com"];

export async function POST(request: NextRequest) {
    try {
        const { userId, adminEmail } = await request.json();

        // Verify admin
        if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Check if Firebase Admin is initialized
        if (!admin.apps.length) {
            return NextResponse.json(
                { error: "Firebase Admin not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to .env" },
                { status: 500 }
            );
        }

        // Delete user from Firebase Auth
        try {
            await admin.auth().deleteUser(userId);
            console.log(`✅ User ${userId} deleted from Firebase Auth`);
        } catch (authError: any) {
            if (authError.code === "auth/user-not-found") {
                console.log(`⚠️ User ${userId} not found in Firebase Auth`);
            } else {
                throw authError;
            }
        }

        return NextResponse.json({
            success: true,
            message: "User deleted from Firebase Auth",
        });

    } catch (error: any) {
        console.error("Error deleting user from Auth:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}
