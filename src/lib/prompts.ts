/**
 * Centralized prompt builder for Gemini API
 * Enhanced but optimized for performance
 */

interface PromptParams {
    niche: string;
    videoStyle: string;
    topic: string;
    tone?: string;
    duration: string;
    language?: string;
}

/**
 * Optimized system prompt - balanced quality and speed
 */
export const SYSTEM_PROMPT = `You are an ELITE TikTok viral strategist with 100M+ views experience.

🔥 VIRAL HOOK FORMULAS (use these):
✓ "Stop scrolling if you [pain point]"
✓ "Nobody tells you [truth] about [topic]"
✓ "I tried [thing] so you don't have to"
✓ "When I learned this, everything changed"
✓ "[Controversial statement] and I'll prove it"
✓ "This changed my [outcome] in [timeframe]"

💡 POWER WORDS: secret, discovered, exposed, actually, nobody, transformed, hidden

⚠️ RULES:
1. Hook: under 7 words, NO emojis
2. Scripts: detailed, story-driven, specific examples
3. NO clichés ("you won't believe")
4. Conversational & fast-paced

🎯 PSYCHOLOGY: Use FOMO, curiosity, social proof, transformation stories`;


/**
 * Build optimized user prompt
 */
export function buildUserPrompt(params: PromptParams): string {
    const { niche, videoStyle, topic, tone, duration, language = "en" } = params;

    // Optimized word counts - 90s reduced to prevent timeout
    const wordCount = duration === '30' ? '150-180'
        : duration === '60' ? '300-360'
            : '350-420';  // Reduced from 450-540 for faster generation

    const langInstruction = language === "tr"
        ? "⚠️ CRITICAL: Generate ALL content in TURKISH."
        : "⚠️ CRITICAL: Generate ALL content in ENGLISH.";

    return `${langInstruction}

📌 Niche: ${niche} | 🎥 Style: ${videoStyle} | 💡 Topic: ${topic}${tone ? ` | 🎭 ${tone}` : ''} | ⏱️ ${duration}s

CRITICAL: Scripts must be LONG ENOUGH to fill ${duration} seconds when spoken naturally.

INSTRUCTIONS:
1. Create 10 UNIQUE hooks (under 7 words each)
2. Write matching ${duration}s script for each (~${wordCount} words)
3. Scripts MUST be detailed and story-driven:
   - Include specific examples
   - Add concrete numbers and details
   - Tell mini-stories
   - Expand every point thoroughly
   - Make it conversational and natural
4. Add 4 timed on-screen captions
5. Write visual prompt for background video

⚠️ RESPOND WITH VALID JSON ONLY (no markdown):

{
  "scripts": [
    {
      "hook": "Hook under 7 words",
      "body": "DETAILED ${duration}s script (~${wordCount} words). Must be conversational, story-driven, and value-dense with specific examples.",
      "callToAction": "Specific CTA"
    }
  ],
  "onScreenText": [
    {"timing": "0-3s", "text": "Hook text"},
    {"timing": "3-10s", "text": "Key point"},
    {"timing": "10-20s", "text": "Insight"},
    {"timing": "20-${duration}s", "text": "CTA"}
  ],
  "visualPrompt": "Background video description in ${language === 'tr' ? 'TURKISH' : 'ENGLISH'}"
}`;
}

/**
 * Build repair prompt
 */
export function buildRepairPrompt(brokenResponse: string): string {
    return `Fix this to valid JSON (no markdown):

${brokenResponse.substring(0, 500)}...

Return corrected JSON:`;
}
