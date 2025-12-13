"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, FileText, Video, Type, Zap, TrendingUp, ChevronRight } from "lucide-react";

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
            className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-white/10"
            onClick={handleCopy}
        >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
    );
}

export function ResultsDisplay({ content, language = "tr" }: ResultsDisplayProps) {
    const [selectedHook, setSelectedHook] = useState(0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Premium Hook Gallery */}
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
                                {language === "tr" ? "En iyi hook'u seçin" : "Select the best hook"}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-none px-4 py-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {content.scripts.length} {language === "tr" ? "Varyasyon" : "Variations"}
                    </Badge>
                </div>

                {/* Hook Cards - Premium Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.scripts.map((script, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedHook(index)}
                            className={`
                                group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
                                ${selectedHook === index
                                    ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-background shadow-xl shadow-cyan-500/20"
                                    : "hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5"
                                }
                            `}
                        >
                            {/* Background Gradient */}
                            <div className={`
                                absolute inset-0 transition-opacity duration-300
                                ${selectedHook === index
                                    ? "bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-pink-500/20"
                                    : "bg-gradient-to-br from-white/5 to-white/[0.02] group-hover:from-cyan-500/10 group-hover:to-purple-500/10"
                                }
                            `} />

                            {/* Border */}
                            <div className={`
                                absolute inset-0 rounded-2xl border transition-colors duration-300
                                ${selectedHook === index
                                    ? "border-cyan-500/50"
                                    : "border-white/10 group-hover:border-white/20"
                                }
                            `} />

                            {/* Content */}
                            <div className="relative p-5">
                                {/* Top Row - Number & Actions */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold transition-all duration-300
                                        ${selectedHook === index
                                            ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                                            : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                                        }
                                    `}>
                                        {index + 1}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <CopyButton text={script.hook} />
                                    </div>
                                </div>

                                {/* Hook Text */}
                                <p className={`
                                    text-base leading-relaxed transition-colors duration-300
                                    ${selectedHook === index
                                        ? "text-white font-medium"
                                        : "text-white/80 group-hover:text-white"
                                    }
                                `}>
                                    {script.hook}
                                </p>

                                {/* Selected Indicator */}
                                {selectedHook === index && (
                                    <div className="flex items-center gap-1 mt-3 text-xs text-cyan-400">
                                        <ChevronRight className="w-3 h-3" />
                                        {language === "tr" ? "Seçili" : "Selected"}
                                    </div>
                                )}
                            </div>

                            {/* Glow Effect for Selected */}
                            {selectedHook === index && (
                                <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 rounded-2xl blur-xl opacity-50" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Script Section - Ultra Premium */}
            <div className="relative">
                {/* Background Glow - Centered */}
                <div className="absolute inset-0 -top-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl opacity-40 pointer-events-none" />

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-orange-500/10 pb-6">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 animate-pulse" />
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
                    <CardContent className="p-8 space-y-8">
                        {/* Hook */}
                        <div className="group space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="text-base font-bold text-white">Hook</h4>
                                </div>
                                <CopyButton text={content.scripts[selectedHook].hook} label={language === "tr" ? "Kopyala" : "Copy"} />
                            </div>
                            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 group-hover:border-cyan-500/40 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-l-2xl" />
                                <p className="text-white text-lg font-medium leading-relaxed pl-4">
                                    {content.scripts[selectedHook].hook}
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="group space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="text-base font-bold text-white">
                                        {language === "tr" ? "Senaryo Metni" : "Script Body"}
                                    </h4>
                                </div>
                                <CopyButton text={content.scripts[selectedHook].body} label={language === "tr" ? "Kopyala" : "Copy"} />
                            </div>
                            <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600 rounded-l-2xl" />
                                <p className="text-white/90 leading-relaxed whitespace-pre-line pl-4">
                                    {content.scripts[selectedHook].body}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="group space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="text-base font-bold text-white">
                                        {language === "tr" ? "Harekete Geçirici Mesaj" : "Call to Action"}
                                    </h4>
                                </div>
                                <CopyButton text={content.scripts[selectedHook].callToAction} label={language === "tr" ? "Kopyala" : "Copy"} />
                            </div>
                            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent border border-pink-500/20 group-hover:border-pink-500/40 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-pink-600 rounded-l-2xl" />
                                <p className="text-white/90 pl-4">
                                    {content.scripts[selectedHook].callToAction}
                                </p>
                            </div>
                        </div>

                        {/* Full Script Copy Button */}
                        <div className="pt-6 border-t border-white/10 flex justify-center">
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium px-8 py-6 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
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

            {/* On-Screen Text - Premium */}
            <div className="relative">
                <div className="absolute inset-0 -top-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-3xl opacity-40 pointer-events-none" />

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-amber-500/10 pb-6">
                        <CardTitle className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                    <Type className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-30 animate-pulse" />
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
                                    className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all cursor-pointer"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-orange-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 px-3">
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

            {/* Visual Prompt - Premium */}
            <div className="relative">
                <div className="absolute inset-0 -top-4 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-3xl opacity-40 pointer-events-none" />

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-green-500/10 via-teal-500/5 to-emerald-500/10 pb-6">
                        <CardTitle className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl blur opacity-30 animate-pulse" />
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
                        <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-green-500/30 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-teal-500 rounded-l-2xl" />
                            <div className="flex items-start justify-between gap-4">
                                <p className="text-white/90 leading-relaxed pl-4 flex-1">{content.visualPrompt}</p>
                                <CopyButton text={content.visualPrompt} label={language === "tr" ? "Kopyala" : "Copy"} />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-lg">💡</span>
                                </div>
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
