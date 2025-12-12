"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, FileText, Video, Type } from "lucide-react";

interface GeneratedContent {
    scripts: {
        hook: string;
        body: string;
        callToAction: string;
    }[];
    onScreenText: {
        timing: string;
        text: string;
    }[];
    visualPrompt: string;
}

interface ResultsDisplayProps {
    content: GeneratedContent;
    language?: string;
    onAnalyze?: (script: { hook: string; body: string }) => void;
    isAnalyzing?: boolean;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (label) {
        return (
            <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-white hover:bg-white/10"
                onClick={handleCopy}
            >
                {copied ? <Check className="w-4 h-4 text-green-400 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {label}
            </Button>
        );
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-white hover:bg-white/10"
            onClick={handleCopy}
        >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
    );
}

export function ResultsDisplay({ content, language = "tr", onAnalyze, isAnalyzing }: ResultsDisplayProps) {
    const [selectedHook, setSelectedHook] = useState(0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Hooks Section */}
            <Card className="glass overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        {language === "tr" ? "Oluşturulan Hook'lar" : "Generated Hooks"}
                        <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                            {content.scripts.length} Varyasyon
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {content.scripts.map((script, index) => (
                            <div
                                key={index}
                                className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${selectedHook === index
                                    ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                                    : "border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5"
                                    }`}
                                onClick={() => setSelectedHook(index)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full gradient-primary text-xs font-bold text-black shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm text-white leading-relaxed">{script.hook}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <CopyButton text={script.hook} />
                                        {onAnalyze && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAnalyze(script);
                                                }}
                                                disabled={isAnalyzing}
                                                title="AI Analizi"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Script Section */}
            <Card className="glass overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <FileText className="w-5 h-5 text-purple-400" />
                        {language === "tr" ? "Seçili Senaryo" : "Selected Script"}
                        <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/50">
                            #{selectedHook + 1}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Hook */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-cyan-400">🪝 {language === "tr" ? "Hook" : "Hook"}</h3>
                            <CopyButton text={content.scripts[selectedHook].hook} label={language === "tr" ? "Kopyala" : "Copy"} />
                        </div>
                        <p className="text-white text-lg leading-relaxed p-4 bg-white/5 rounded-lg border border-white/10">
                            {content.scripts[selectedHook].hook}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-purple-400">📝 {language === "tr" ? "Senaryo Metni" : "Script Body"}</h3>
                            <CopyButton text={content.scripts[selectedHook].body} label={language === "tr" ? "Kopyala" : "Copy"} />
                        </div>
                        <p className="text-white/90 leading-relaxed p-4 bg-white/5 rounded-lg border border-white/10 whitespace-pre-line">
                            {content.scripts[selectedHook].body}
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-pink-400">🎯 {language === "tr" ? "Harekete Geçirici Mesaj" : "Call to Action"}</h3>
                            <CopyButton text={content.scripts[selectedHook].callToAction} label={language === "tr" ? "Kopyala" : "Copy"} />
                        </div>
                        <p className="text-white/90 p-4 bg-white/5 rounded-lg border border-white/10">
                            {content.scripts[selectedHook].callToAction}
                        </p>
                    </div>

                    {/* Full Script Copy */}
                    <div className="pt-4 border-t border-white/10">
                        <CopyButton
                            text={`${content.scripts[selectedHook].hook}\n\n${content.scripts[selectedHook].body}\n\n${content.scripts[selectedHook].callToAction}`}
                            label={language === "tr" ? "📋 Tüm Senaryoyu Kopyala" : "📋 Copy Full Script"}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* On-Screen Text */}
            <Card className="glass overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Type className="w-5 h-5 text-yellow-400" />
                        {language === "tr" ? "Ekran Üstü Yazılar" : "On-Screen Text"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {content.onScreenText.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-yellow-500/50 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs">
                                        {item.timing}
                                    </Badge>
                                    <CopyButton text={item.text} />
                                </div>
                                <p className="text-white text-sm">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Visual Prompt */}
            <Card className="glass overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-gradient-to-r from-green-500/10 to-teal-500/10">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Video className="w-5 h-5 text-green-400" />
                        {language === "tr" ? "Görsel Prompt (Arka Plan Video)" : "Visual Prompt (Background Video)"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <p className="text-white/90 leading-relaxed flex-1">{content.visualPrompt}</p>
                        <CopyButton text={content.visualPrompt} label={language === "tr" ? "Kopyala" : "Copy"} />
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <p className="text-xs text-green-300">
                            💡 {language === "tr"
                                ? "Bu açıklamayı Canva AI, Runway ML veya benzer video oluşturma araçlarında kullanabilirsiniz."
                                : "Use this description in Canva AI, Runway ML, or similar video generation tools."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
