import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini, GeminiTimeoutError, GeminiRateLimitError } from "@/lib/gemini";
import { checkGenerationLimit } from "@/lib/limits";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Admin emails - same as AuthContext
const ADMIN_EMAILS = [
    "widrivite@gmail.com",
];

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

/**
 * POST /api/generate
 * 
 * Generate viral TikTok/Reels content with Gemini AI
 * 
 * Security features:
 * - No API key exposure in logs or responses
 * - Rate limiting per user
 * - Request ID tracking
 * - Timeout protection
 * 
 * Error handling:
 * - 400: Missing required fields
 * - 401: Missing user authentication
 * - 429: Rate limit exceeded
 * - 500: Server/API error
 * - 503: Timeout
 */
export async function POST(request: NextRequest) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // Parse request body
        const body = await request.json();
        const {
            niche,
            videoStyle,
            topic,
            tone,
            duration = "60",
            language = "tr",
            userId
        } = body;

        console.log(`[${requestId}] Generation request started`);

        // Validate required fields
        if (!niche || !videoStyle || !topic) {
            console.log(`[${requestId}] Missing required fields`);
            return NextResponse.json(
                { error: "Missing required fields: niche, videoStyle, and topic are required" },
                { status: 400 }
            );
        }

        // Check for user ID (required for rate limiting)
        if (!userId) {
            console.log(`[${requestId}] Missing user ID`);
            return NextResponse.json(
                { error: "User authentication required" },
                { status: 401 }
            );
        }

        // Check if user is admin (admins have unlimited generations)
        let isAdmin = false;
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            const userEmail = userDoc.data()?.email;
            isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
            if (isAdmin) {
                console.log(`[${requestId}] Admin user - bypassing rate limit`);
            }
        } catch (error) {
            console.error(`[${requestId}] Error checking admin:`, error);
        }


        // Check rate limits (skip for admins)
        if (!isAdmin) {
            const limitCheck = await checkGenerationLimit(userId);
            if (!limitCheck.allowed) {
                console.log(`[${requestId}] Rate limit exceeded for user ${userId}`);
                return NextResponse.json(
                    {
                        error: "Daily generation limit reached",
                        detail: `You've used all ${limitCheck.isPro ? 100 : 3} generations today. ${limitCheck.isPro ? '' : 'Upgrade to Pro for more!'
                            }`,
                        remaining: 0
                    },
                    { status: 429 }
                );
            }
            console.log(`[${requestId}] Rate limit OK: ${limitCheck.remaining} remaining`);
        }


        // Call Gemini API with new infrastructure
        const result = await generateWithGemini({
            niche,
            videoStyle,
            topic,
            tone,
            duration,
            language,
        });

        console.log(`[${requestId}] Success: Generated ${result.scripts.length} scripts`);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        // Handle specific error types
        if (error instanceof GeminiTimeoutError) {
            console.error(`[${requestId}] Timeout error`);
            return NextResponse.json(
                {
                    error: "Generation timed out",
                    detail: "The AI took too long to respond. Please try again.",
                    code: "TIMEOUT"
                },
                { status: 503 }
            );
        }

        if (error instanceof GeminiRateLimitError) {
            console.error(`[${requestId}] Gemini rate limit`);
            return NextResponse.json(
                {
                    error: "AI service rate limit",
                    detail: "Too many requests to AI service. Please wait a moment.",
                    code: "RATE_LIMIT"
                },
                { status: 429 }
            );
        }

        // Generic error
        console.error(`[${requestId}] Generation error:`, error.message);

        // NEVER expose API keys or sensitive data
        const safeMessage = error.message?.replace(
            /sk-[a-zA-Z0-9]+/g,
            "[REDACTED]"
        );

        return NextResponse.json(
            {
                error: "Generation failed",
                detail: process.env.NODE_ENV === 'development' ? safeMessage : "An error occurred",
                code: "SERVER_ERROR"
            },
            { status: 500 }
        );
    }
}
