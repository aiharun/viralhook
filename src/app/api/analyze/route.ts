import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

interface AnalyzeRequest {
    hook: string;
    body: string;
    niche: string;
    videoStyle: string;
}

interface AnalysisResult {
    viralScore: number;
    engagement: {
        likeRate: number;
        commentRate: number;
        shareRate: number;
        saveRate: number;
    };
    viewPrediction: {
        min: number;
        max: number;
        avgWatchTime: number;
    };
    analysis: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        hookQuality: {
            wordCount: number;
            powerWords: number;
            emotionTrigger: string;
            patternMatch: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const { hook, body, niche, videoStyle }: AnalyzeRequest = await request.json();

        if (!hook || !body) {
            return NextResponse.json(
                { error: "Hook and body are required" },
                { status: 400 }
            );
        }

        const prompt = `Sen viral içerik analisti ve TikTok algoritması uzmanısın.

Bu içeriği analiz et ve performans tahmini yap:

Hook: "${hook}"
Script: "${body}"
Niş: ${niche}
Stil: ${videoStyle}

⚠️ KRİTİK: Tüm yanıtını TÜRKÇE olarak ver.

Detaylı analizi JSON formatında sun (markdown yok):

{
  "viralScore": 0-100,
  "engagement": {
    "likeRate": 2-8,
    "commentRate": 0.5-3,
    "shareRate": 0.2-2,
    "saveRate": 0.5-5
  },
  "viewPrediction": {
    "min": 1000-10000,
    "max": 10000-100000,
    "avgWatchTime": 30-80
  },
  "analysis": {
    "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
    "weaknesses": ["zayıf nokta 1", "zayıf nokta 2"],
    "suggestions": ["uygulanabilir öneri 1", "uygulanabilir öneri 2"],
    "hookQuality": {
      "wordCount": X,
      "powerWords": X,
      "emotionTrigger": "merak/şok/komedi/empati/motivasyon",
      "patternMatch": "pattern adı veya 'yok'"
    }
  }
}

Analiz kriterleri:
- Hook uzunluğu (5-7 kelime = en iyi)
- Güç kelimeleri (gizli, keşfettim, kimse söylemez, açığa çıktı, vb)
- Psikolojik tetikleyiciler (FOMO, merak, sosyal kanıt)
- Duygu hedefleme
- Viral formül eşleşmesi
- Script kalitesi ve etkileşim
- Niş uygunluğu

Gerçekçi tahminler yap. SADECE geçerli JSON döndür.`;

        const result = await generateText({
            model: google("gemini-2.0-flash-exp"),
            prompt: prompt,
            temperature: 0.7,
        });

        // Clean response
        let cleanedResponse = result.text.trim();
        if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
        }

        const analysis: AnalysisResult = JSON.parse(cleanedResponse);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze content" },
            { status: 500 }
        );
    }
}
