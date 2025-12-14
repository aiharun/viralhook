import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
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
        } catch (error) {
            console.error("Failed to initialize Firebase Admin:", error);
        }
    }
}

const ADMIN_EMAILS = ["widrivite@gmail.com"];

export async function POST(request: NextRequest) {
    try {
        const { email, password, username, isPro, isAdmin, adminEmail } = await request.json();

        // Verify admin
        if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Validations
        if (!email || !password || !username) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (!admin.apps.length) {
            return NextResponse.json({ error: "Server config error" }, { status: 500 });
        }

        // 1. Check if username exists
        const db = admin.firestore();
        const usernameQuery = await db.collection("users").where("username", "==", username.toLowerCase()).get();
        if (!usernameQuery.empty) {
            return NextResponse.json({ error: "Kullanıcı adı kullanımda" }, { status: 400 });
        }

        // 2. Create Auth User
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username,
            emailVerified: true
        });

        // 3. Create Firestore User
        await db.collection("users").doc(userRecord.uid).set({
            email,
            username: username.toLowerCase(),
            displayUsername: username,
            isPro: isPro || false,
            isAdmin: isAdmin || false,
            generationsToday: 0,
            generationsTotal: 0,
            creditsRemaining: 3,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            lastGenerationDate: new Date().toISOString().split('T')[0]
        });

        return NextResponse.json({ success: true, userId: userRecord.uid });

    } catch (error: any) {
        console.error("Create user error:", error);
        const errorMessage = error.code === 'auth/email-already-exists'
            ? 'Bu email adresi zaten kullanımda'
            : error.message || "Failed";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
