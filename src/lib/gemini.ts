import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT, buildUserPrompt, buildRepairPrompt } from "./prompts";
import { validateGenerationResponse, GenerationResponse } from "./schema";

/**
 * Configuration for Gemini API calls
 */
const CONFIG = {
    MODEL: "gemini-2.0-flash-exp",
    TEMPERATURE: 0.85,
    TIMEOUT_MS: 50000, // 50 seconds (increased from 35s for 90s scripts)
    MAX_RETRIES: 3,
    RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff
} as const;

/**
 * Custom error types for better error handling
 */
export class GeminiTimeoutError extends Error {
    constructor() {
        super("Gemini API request timed out");
        this.name = "GeminiTimeoutError";
    }
}

export class GeminiRateLimitError extends Error {
    constructor() {
        super("Gemini API rate limit exceeded");
        this.name = "GeminiRateLimitError";
    }
}

export class GeminiInvalidResponseError extends Error {
    constructor(message: string) {
        super(`Invalid Gemini response: ${message}`);
        this.name = "GeminiInvalidResponseError";
    }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean JSON response from Gemini (remove markdown code blocks)
 */
function cleanJsonResponse(text: string): string {
    return text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
}

/**
 * Call Gemini API with timeout protection
 */
async function callGeminiWithTimeout(
    prompt: string,
    requestId: string
): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
        console.log(`[${requestId}] Calling Gemini API (timeout: ${CONFIG.TIMEOUT_MS}ms)`);

        const { text } = await generateText({
            model: google(CONFIG.MODEL),
            system: SYSTEM_PROMPT,
            prompt,
            temperature: CONFIG.TEMPERATURE,
            abortSignal: controller.signal,
        });

        clearTimeout(timeoutId);
        return text;
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
            throw new GeminiTimeoutError();
        }

        throw error;
    }
}

/**
 * Try to parse and validate JSON response
 * Returns validated data or throws error
 */
function parseAndValidate(text: string, requestId: string): GenerationResponse {
    const cleaned = cleanJsonResponse(text);

    try {
        const parsed = JSON.parse(cleaned);
        return validateGenerationResponse(parsed);
    } catch (error) {
        console.error(`[${requestId}] JSON parse/validation failed:`, error);
        throw new GeminiInvalidResponseError(
            error instanceof Error ? error.message : "Failed to parse response"
        );
    }
}

/**
 * Main function: Generate content with Gemini
 * Includes retry logic, timeout, and JSON repair
 */
export async function generateWithGemini(params: {
    niche: string;
    videoStyle: string;
    topic: string;
    tone?: string;
    wordCount: string;
    language?: string;
    // Advanced targeting fields
    targetAudience?: string;
    painPoint?: string;
    uniqueValue?: string;
}): Promise<GenerationResponse> {
    const requestId = generateRequestId();
    const userPrompt = buildUserPrompt(params);

    console.log(`[${requestId}] Starting generation request`);
    console.log(`[${requestId}] Params:`, {
        niche: params.niche,
        videoStyle: params.videoStyle,
        wordCount: params.wordCount,
        language: params.language
    });

    let lastError: Error | null = null;
    let response: string | null = null;

    // Main retry loop
    for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
        try {
            console.log(`[${requestId}] Attempt ${attempt + 1}/${CONFIG.MAX_RETRIES}`);

            // Call Gemini API
            response = await callGeminiWithTimeout(userPrompt, requestId);

            // Try to parse and validate
            const validated = parseAndValidate(response, requestId);

            console.log(`[${requestId}] Success! Generated ${validated.scripts.length} scripts`);
            return validated;

        } catch (error: any) {
            lastError = error;

            // Don't retry timeouts or rate limits
            if (error instanceof GeminiTimeoutError) {
                console.error(`[${requestId}] Timeout - not retrying`);
                throw error;
            }

            if (error.message?.includes("429") || error.message?.includes("rate limit")) {
                console.error(`[${requestId}] Rate limit - not retrying`);
                throw new GeminiRateLimitError();
            }

            // For JSON errors, try repair prompt once
            if (error instanceof GeminiInvalidResponseError && response && attempt === 0) {
                console.log(`[${requestId}] Attempting JSON repair`);
                try {
                    const repairPrompt = buildRepairPrompt(response);
                    response = await callGeminiWithTimeout(repairPrompt, requestId);
                    const validated = parseAndValidate(response, requestId);
                    console.log(`[${requestId}] Repair successful!`);
                    return validated;
                } catch (repairError) {
                    console.error(`[${requestId}] Repair failed:`, repairError);
                    // Continue to next retry
                }
            }

            // Wait before retry (exponential backoff)
            if (attempt < CONFIG.MAX_RETRIES - 1) {
                const delay = CONFIG.RETRY_DELAYS[attempt];
                console.log(`[${requestId}] Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    // All retries exhausted
    console.error(`[${requestId}] All retries exhausted`);
    throw lastError || new Error("Generation failed after all retries");
}

/**
 * Health check for Gemini API
 */
export async function healthCheck(): Promise<boolean> {
    try {
        const { text } = await generateText({
            model: google(CONFIG.MODEL),
            prompt: "Reply with OK",
        });
        return text.toLowerCase().includes("ok");
    } catch {
        return false;
    }
}
