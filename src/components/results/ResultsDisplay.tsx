"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Video, Type, Zap, TrendingUp, ChevronRight } from "lucide-react";

interface GeneratedContent {
    scripts: { hook: string; body: string; callToAction: string; }[];
    onScreenText: { timing: string; text: string; }[];
    visualPrompt: string;
}

interface ResultsDisplayProps {
    content: GeneratedContent;
    language?: string;
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
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/10" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-400 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {label}
            </Button>
        );
    }

    return (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-white/10" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
    );
}

export function ResultsDisplay({ content, language = "tr" }: ResultsDisplayProps) {
    const [selectedHook, setSelectedHook] = useState(0);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Hook Gallery */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {language === "tr" ? "Viral Hook'lar" : "Viral Hooks"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {language === "tr" ? "Bir hook seçin" : "Select a hook"}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-none px-4 py-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {content.scripts.length} {language === "tr" ? "Varyasyon" : "Variations"}
                    </Badge>
                </div>

                {/* Hook Cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.scripts.map((script, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedHook(index)}
                            className={`
                                group relative p-4 rounded-2xl cursor-pointer transition-all duration-300
                                ${selectedHook === index
                                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                                }
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                                    ${selectedHook === index ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60'}
                                `}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm leading-relaxed ${selectedHook === index ? 'text-white' : 'text-white/80'}`}>
                                        {script.hook}
                                    </p>
                                    {selectedHook === index && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-cyan-400">
                                            <ChevronRight className="w-3 h-3" />
                                            {language === "tr" ? "Seçili" : "Selected"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={script.hook} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Script */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl blur-2xl opacity-50 pointer-events-none" />

                <Card className="relative border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pb-6">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {language === "tr" ? "Seçili Senaryo" : "Selected Script"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-normal flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                        Hook #{selectedHook + 1} {language === "tr" ? "seçili" : "selected"}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-purple-500/30 px-4 py-1">
                                {language === "tr" ? "Tam Senaryo" : "Full Script"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {/* Hook */}
                        <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                    🎣 Hook
                                </Badge>
                                <CopyButton text={content.scripts[selectedHook].hook} />
                            </div>
                            <p className="text-white font-medium text-lg">{content.scripts[selectedHook].hook}</p>
                        </div>

                        {/* Body */}
                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    📝 Script
                                </Badge>
                                <CopyButton text={content.scripts[selectedHook].body} />
                            </div>
                            <p className="text-white/90 leading-relaxed">{content.scripts[selectedHook].body}</p>
                        </div>

                        {/* CTA */}
                        <div className="p-5 rounded-xl bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                    📣 CTA
                                </Badge>
                                <CopyButton text={content.scripts[selectedHook].callToAction} />
                            </div>
                            <p className="text-white font-medium">{content.scripts[selectedHook].callToAction}</p>
                        </div>

                        {/* Copy All Button */}
                        <div className="pt-4 border-t border-white/10 flex justify-center">
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium px-8 py-6 shadow-lg"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${content.scripts[selectedHook].hook}\n\n${content.scripts[selectedHook].body}\n\n${content.scripts[selectedHook].callToAction}`
                                    );
                                }}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                {language === "tr" ? "Tüm Senaryoyu Kopyala" : "Copy Full Script"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* On-Screen Text */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-2xl opacity-50 pointer-events-none" />

                <Card className="relative border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pb-6">
                        <CardTitle className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <Type className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {language === "tr" ? "Ekran Üstü Yazılar" : "On-Screen Text"}
                                </h3>
                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                    {language === "tr" ? "Zamanlamalı metin önerileri" : "Timed text suggestions"}
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {content.onScreenText.map((item, index) => (
                                <div
                                    key={index}
                                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3">
                                            ⏱️ {item.timing}
                                        </Badge>
                                        <CopyButton text={item.text} />
                                    </div>
                                    <p className="text-white text-sm leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visual Prompt */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl blur-2xl opacity-50 pointer-events-none" />

                <Card className="relative border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-green-500/10 to-teal-500/10 pb-6">
                        <CardTitle className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {language === "tr" ? "Görsel Prompt" : "Visual Prompt"}
                                </h3>
                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                    {language === "tr" ? "AI video oluşturma için hazır" : "Ready for AI video generation"}
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-start justify-between gap-4">
                                <p className="text-white/90 leading-relaxed flex-1">{content.visualPrompt}</p>
                                <CopyButton text={content.visualPrompt} label={language === "tr" ? "Kopyala" : "Copy"} />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-start gap-3">
                                <span className="text-lg">💡</span>
                                <p className="text-sm text-green-300 leading-relaxed">
                                    {language === "tr"
                                        ? "Bu açıklamayı Canva AI, Runway ML, Pika Labs veya benzer video oluşturma araçlarında kullanabilirsiniz."
                                        : "Use this description in Canva AI, Runway ML, Pika Labs, or similar video generation tools."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
