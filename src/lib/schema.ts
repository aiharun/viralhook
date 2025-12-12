import { z } from "zod";

/**
 * Schema for individual script variation
 */
export const ScriptSchema = z.object({
    hook: z.string().min(1).max(50), // Short, punchy hooks
    body: z.string().min(50), // Detailed script body
    callToAction: z.string().min(1),
});

/**
 * Schema for on-screen caption timing
 */
export const CaptionSchema = z.object({
    timing: z.string(), // e.g., "0-3s"
    text: z.string().min(1),
});

/**
 * Main response schema for Gemini API with strict validation
 * This enforces the new structure with quality controls
 */
export const GenerationResponseSchema = z.object({
    // 10 hook variations for user selection
    scripts: z.array(ScriptSchema).min(10).max(10),

    // On-screen text overlays with timing
    onScreenText: z.array(CaptionSchema).min(3),

    // Visual direction for video editor
    visualPrompt: z.string().min(20),
});

/**
 * Enhanced schema with additional quality fields
 * Used for future iterations
 */
export const EnhancedGenerationSchema = GenerationResponseSchema.extend({
    bestHook: z.string().optional(), // AI's recommendation
    deliveryNotes: z.string().optional(), // Tone/pacing guidance
    ctaSoft: z.string().optional(), // Gentle CTA (like, subscribe)
    ctaGrowth: z.string().optional(), // Action-oriented CTA
});

/**
 * Type exports for TypeScript
 */
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
export type EnhancedGeneration = z.infer<typeof EnhancedGenerationSchema>;
export type Script = z.infer<typeof ScriptSchema>;
export type Caption = z.infer<typeof CaptionSchema>;

/**
 * Validation helper with detailed error messages
 */
export function validateGenerationResponse(data: unknown): GenerationResponse {
    try {
        return GenerationResponseSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new Error(`Invalid generation response: ${issues}`);
        }
        throw error;
    }
}
