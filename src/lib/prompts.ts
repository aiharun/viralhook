/**
 * Centralized prompt builder for Gemini API
 * Enhanced but optimized for performance
 */

interface PromptParams {
  niche: string;
  videoStyle: string;
  topic: string;
  tone?: string;
  wordCount: string;
  language?: string;
  // Advanced targeting for more engaging content
  targetAudience?: string;
  painPoint?: string;
  uniqueValue?: string;
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

📣 POWERFUL CTA FORMULAS (MUST USE - make them URGENT & SPECIFIC):
✓ "Kaydet çünkü [specific reason] - sonra bulamazsın"
✓ "Şimdi takip et yoksa [miss out on what]"
✓ "Yoruma [specific word] yaz, sana [specific value] atayım"
✓ "Bu videoyu [person] ile paylaş - teşekkür edecek"
✓ "Profilimdeki linke tıkla - [specific benefit] seni bekliyor"
✓ "Beğen ve kaydet - daha fazlası için takip et"
✓ "Yoruma [emoji] koy, seninle iletişime geçeyim"
✓ "[Number] kişi bunu kaçırdı, sen kaçırma"

⚠️ RULES:
1. Hook: under 7 words, NO emojis
2. Scripts: detailed, story-driven, specific examples
3. NO clichés ("you won't believe")
4. Conversational & fast-paced
5. CTA: MUST be URGENT, SPECIFIC, and create FOMO

🎯 PSYCHOLOGY: Use FOMO, curiosity, social proof, transformation stories
📣 CTA PSYCHOLOGY: Scarcity, urgency, clear benefit, specific action, loss aversion`;


/**
 * Build optimized user prompt
 */
export function buildUserPrompt(params: PromptParams): string {
  const {
    niche, videoStyle, topic, tone, wordCount, language = "en",
    targetAudience, painPoint, uniqueValue
  } = params;

  // Parse word count range (e.g., "30-50" -> min: 30, max: 50)
  const [minWords, maxWords] = wordCount.split('-').map(Number);
  const wordRange = `${minWords}-${maxWords}`;

  const langInstruction = language === "tr"
    ? "⚠️ CRITICAL: Generate ALL content in TURKISH."
    : "⚠️ CRITICAL: Generate ALL content in ENGLISH.";

  // Build advanced targeting section if provided
  const targetingSection = (targetAudience || painPoint || uniqueValue) ? `

🎯 ADVANCED TARGETING (USE THIS TO CREATE MORE RELEVANT CONTENT):
${targetAudience ? `• Target Audience: ${targetAudience} - tailor language and examples specifically for them` : ''}
${painPoint ? `• Pain Point/Problem: ${painPoint} - address this directly in hooks and scripts` : ''}
${uniqueValue ? `• Unique Value: ${uniqueValue} - weave this into the content authentically` : ''}

Use this targeting info to make hooks more specific, relatable, and scroll-stopping.` : '';

  return `${langInstruction}

📌 Niche: ${niche} | 🎥 Style: ${videoStyle} | 💡 Topic: ${topic}${tone ? ` | 🎭 ${tone}` : ''} | 📝 ${wordRange} kelime
${targetingSection}

CRITICAL: Scripts must be EXACTLY ${wordRange} words long - not more, not less.

INSTRUCTIONS:
1. Create 10 UNIQUE hooks (under 7 words each)
2. Write matching script for each (${wordRange} kelime)
3. Scripts MUST be detailed and story-driven:
   - Include specific examples
   - Add concrete numbers and details
   - Tell mini-stories
   - Expand every point thoroughly
   - Make it conversational and natural
4. ⚠️ ON-SCREEN TEXT RULES:
   - 6 timed captions that complement (not duplicate) the spoken script
   - Each caption: MAX 5 words, impactful, easy to read
   - Use: numbers, emojis for emphasis, power words
   - Timing must match video duration
5. Write visual prompt for background video
6. ⚠️ CTA MUST BE: Urgent, specific action, FOMO-inducing, benefit-focused (15-25 words)

⚠️ RESPOND WITH VALID JSON ONLY (no markdown):

{
  "scripts": [
    {
      "hook": "Hook under 7 words",
      "body": "DETAILED script (${wordRange} kelime). Must be conversational, story-driven, and value-dense with specific examples.",
      "callToAction": "POWERFUL CTA (15-25 words): Urgent action + specific benefit + FOMO. Example: 'Kaydet ve takip et yoksa bu bilgiyi bir daha bulamazsın - 2 gün sonra siliniyor'"
    }
  ],
  "onScreenText": [
    {"timing": "0-3s", "text": "🔥 Hook text (catchy, max 4 words)"},
    {"timing": "3-8s", "text": "💡 Key stat/number (e.g. '%87 bunu bilmiyor')"},
    {"timing": "8-15s", "text": "⚡ Problem/pain point (direct, relatable)"},
    {"timing": "15-25s", "text": "✅ Solution preview (benefit-focused)"},
    {"timing": "25-30s", "text": "🎯 Key takeaway (memorable)"},
    {"timing": "30-35s", "text": "👆 CTA text (action-focused, URGENT)"}
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
