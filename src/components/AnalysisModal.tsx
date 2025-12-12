"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp, Heart, MessageCircle, Share2, Bookmark,
    Eye, CheckCircle, AlertCircle, Lightbulb, Target
} from "lucide-react";

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

interface AnalysisModalProps {
    open: boolean;
    onClose: () => void;
    result: AnalysisResult | null;
}

export default function AnalysisModal({ open, onClose, result }: AnalysisModalProps) {
    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Mükemmel";
        if (score >= 60) return "İyi";
        if (score >= 40) return "Orta";
        return "Zayıf";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-400" />
                        Hook Analiz Raporu
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Viral Score */}
                    <Card className="glass border-white/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm text-muted-foreground">Viral Potansiyel</h3>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className={`text-4xl font-bold ${getScoreColor(result.viralScore)}`}>
                                            {result.viralScore}
                                        </span>
                                        <span className="text-lg text-muted-foreground">/100</span>
                                    </div>
                                    <Badge className={`mt-2 ${result.viralScore >= 80 ? 'bg-green-500/20 text-green-400' : result.viralScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {getScoreLabel(result.viralScore)}
                                    </Badge>
                                </div>
                                <TrendingUp className={`w-16 h-16 ${getScoreColor(result.viralScore)}`} />
                            </div>
                            <Progress value={result.viralScore} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Hook Quality & Engagement - Side by side on desktop, stacked on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Hook Kalitesi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Kelime Sayısı</p>
                                        <p className="text-lg font-semibold text-white">{result.analysis.hookQuality.wordCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Güç Kelimeleri</p>
                                        <p className="text-lg font-semibold text-white">{result.analysis.hookQuality.powerWords}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Duygu</p>
                                        <Badge variant="outline" className="mt-1">{result.analysis.hookQuality.emotionTrigger}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pattern</p>
                                        <p className="text-xs text-white mt-1">{result.analysis.hookQuality.patternMatch}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement Prediction */}
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Tahmini Etkileşim</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-pink-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Beğeni</p>
                                            <p className="text-lg font-semibold text-white">{result.engagement.likeRate}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Yorum</p>
                                            <p className="text-lg font-semibold text-white">{result.engagement.commentRate}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Share2 className="w-5 h-5 text-green-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Paylaşım</p>
                                            <p className="text-lg font-semibold text-white">{result.engagement.shareRate}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Bookmark className="w-5 h-5 text-yellow-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Kaydetme</p>
                                            <p className="text-lg font-semibold text-white">{result.engagement.saveRate}%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* View Prediction */}
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Görüntülenme Tahmini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {result.viewPrediction.min.toLocaleString()} - {result.viewPrediction.max.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">görüntülenme</p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Ortalama İzlenme Süresi</span>
                                        <span className="text-white font-semibold">{result.viewPrediction.avgWatchTime}%</span>
                                    </div>
                                    <Progress value={result.viewPrediction.avgWatchTime} className="h-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strengths */}
                    {result.analysis.strengths.length > 0 && (
                        <Card className="glass border-green-500/20">
                            <CardHeader>
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Güçlü Yönler
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.analysis.strengths.map((strength, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-green-300">
                                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Weaknesses */}
                    {result.analysis.weaknesses.length > 0 && (
                        <Card className="glass border-yellow-500/20">
                            <CardHeader>
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                                    İyileştirilebilir
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.analysis.weaknesses.map((weakness, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-yellow-300">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Suggestions */}
                    {result.analysis.suggestions.length > 0 && (
                        <Card className="glass border-purple-500/20">
                            <CardHeader>
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-purple-400" />
                                    Öneriler
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.analysis.suggestions.map((suggestion, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-purple-300">
                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
