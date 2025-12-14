"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Rocket, Sparkles, Loader2, Crown, Lock, Check, AlertCircle,
    Lightbulb, Shuffle, Zap, ChevronRight, ChevronLeft, ArrowRight, Home
} from "lucide-react";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { useAuth, MAX_FREE_GENERATIONS } from "@/contexts/AuthContext";
import { saveGeneration } from "@/lib/scriptService";

// ============================================
// DATA CONSTANTS
// ============================================

const NICHES = [
    { key: "fitness", value: "fitness", emoji: "💪", label: "Fitness", color: "from-red-500 to-orange-500", free: true },
    { key: "finance", value: "finance", emoji: "💰", label: "Finans", color: "from-green-500 to-emerald-500", free: true },
    { key: "food", value: "food", emoji: "🍕", label: "Yemek", color: "from-yellow-500 to-orange-500", free: true },
    { key: "relationships", value: "relationships", emoji: "❤️", label: "İlişkiler", color: "from-rose-500 to-pink-500", free: true },
    { key: "tech", value: "tech", emoji: "💻", label: "Teknoloji", color: "from-blue-500 to-cyan-500", free: false },
    { key: "travel", value: "travel", emoji: "✈️", label: "Seyahat", color: "from-purple-500 to-pink-500", free: false },
    { key: "fashion", value: "fashion", emoji: "👗", label: "Moda", color: "from-pink-500 to-rose-500", free: false },
    { key: "gaming", value: "gaming", emoji: "🎮", label: "Oyun", color: "from-indigo-500 to-purple-500", free: false },
    { key: "beauty", value: "beauty", emoji: "💄", label: "Güzellik", color: "from-pink-400 to-fuchsia-500", free: false },
    { key: "education", value: "education", emoji: "📚", label: "Eğitim", color: "from-purple-500 to-violet-500", free: false },
    { key: "crypto", value: "crypto", emoji: "🪙", label: "Kripto", color: "from-cyan-500 to-teal-500", free: false },
    { key: "comedy", value: "comedy", emoji: "😂", label: "Komedi", color: "from-yellow-500 to-amber-500", free: false },
    { key: "motivation", value: "motivation", emoji: "🔥", label: "Motivasyon", color: "from-amber-500 to-orange-600", free: false },
    { key: "lifestyle", value: "lifestyle", emoji: "✨", label: "Yaşam Tarzı", color: "from-teal-400 to-green-500", free: false },
    { key: "business", value: "business", emoji: "💼", label: "İş & Kariyer", color: "from-slate-500 to-gray-600", free: false },
    { key: "health", value: "health", emoji: "🏥", label: "Sağlık", color: "from-emerald-500 to-green-600", free: false },
];

const VIDEO_STYLES = [
    { key: "storytelling", value: "storytelling", emoji: "📖", label: "Hikaye", desc: "Kişisel deneyimlerini paylaş, izleyiciyle duygusal bağ kur" },
    { key: "hardSales", value: "hard sales", emoji: "🎯", label: "Satış", desc: "Ürün veya hizmetini doğrudan tanıt, alım aksiyonu oluştur" },
    { key: "reaction", value: "reaction/duet", emoji: "🎭", label: "Tepki", desc: "Trendlere veya başka videolara tepki vererek etkileşim al" },
    { key: "educational", value: "educational/how-to", emoji: "🎓", label: "Eğitici", desc: "Adım adım bir şeyi öğret, bilgi paylaş, değer kat" },
    { key: "controversy", value: "controversy", emoji: "🔥", label: "Tartışmalı", desc: "Cesur fikirler paylaş, dikkat çek, tartışma başlat" },
    { key: "motivation", value: "motivation", emoji: "💪", label: "Motivasyon", desc: "İlham ver, harekete geçir, pozitif enerji yay" },
];

const TONES = [
    { key: "funny", value: "funny", emoji: "😂", label: "Komik", desc: "Güldürürken değer katan, eğlenceli ve akılda kalıcı içerik" },
    { key: "serious", value: "serious", emoji: "🎯", label: "Ciddi", desc: "Doğrudan, güvenilir ve profesyonel bilgi aktarımı" },
    { key: "dramatic", value: "dramatic", emoji: "🎭", label: "Dramatik", desc: "Duygusal, hikaye odaklı ve etkileyici anlatım" },
    { key: "casual", value: "casual", emoji: "😎", label: "Rahat", desc: "Arkadaşça, samimi ve doğal bir sohbet havası" },
    { key: "professional", value: "professional", emoji: "👔", label: "Profesyonel", desc: "Uzman, otoriter ve güven veren ton" },
    { key: "edgy", value: "edgy", emoji: "🔥", label: "Cesur", desc: "Provokatif, dikkat çekici ve sıradışı yaklaşım" },
];

const WORD_COUNTS = [
    { value: "10-30", label: "Kısa", desc: "10-30 kelime" },
    { value: "30-50", label: "Orta", desc: "30-50 kelime" },
    { value: "50-80", label: "Uzun", desc: "50-80 kelime" },
];

const STEPS = [
    { num: 1, title: "Niş Seçimi", icon: "🎯" },
    { num: 2, title: "Video Stili", icon: "🎬" },
    { num: 3, title: "Ton & Uzunluk", icon: "🎭" },
    { num: 4, title: "Konu", icon: "💡" },
];

// Topic generator
const generateRandomTopic = (niche: string): string => {
    const topics: Record<string, string[]> = {
        fitness: ["sabah egzersizi", "karın kası", "kilo verme", "protein", "yağ yakma", "kas yapma"],
        finance: ["bütçe yönetimi", "tasarruf", "yatırım", "pasif gelir", "kripto", "finansal özgürlük"],
        relationships: ["iletişim", "güven", "ilk buluşma", "sevgi dili", "kendini sevme", "flört"],
        food: ["hızlı tarif", "sağlıklı yemek", "tatlı", "kahvaltı", "akşam yemeği", "atıştırmalık"],
        tech: ["iPhone ipuçları", "yapay zeka", "uygulama", "verimlilik", "güvenlik", "trend"],
        travel: ["bütçe seyahat", "gizli yerler", "otel ipuçları", "vize", "bavul", "uçuş"],
        fashion: ["kapsül dolap", "trend", "kombin", "alışveriş", "renk uyumu", "stil"],
        gaming: ["oyun taktikleri", "e-spor", "setup", "yeni oyun", "speedrun", "easter egg"],
        beauty: ["cilt bakımı", "makyaj", "saç bakımı", "anti-aging", "güneş koruması", "doğal"],
        education: ["çalışma teknikleri", "hafıza", "sınav", "motivasyon", "zaman", "verimlilik"],
        crypto: ["Bitcoin", "altcoin", "DeFi", "NFT", "portföy", "analiz"],
        comedy: ["günlük hayat", "ilişki komedisi", "iş hayatı", "aile", "okul", "sosyal medya"],
        motivation: ["sabah rutini", "hedef", "başarı", "disiplin", "alışkanlık", "özgüven"],
        lifestyle: ["minimalizm", "self-care", "üretkenlik", "meditasyon", "günlük", "rutin"],
        business: ["girişimcilik", "networking", "liderlik", "satış", "pazarlama", "mülakat"],
        health: ["uyku", "stres", "beslenme", "egzersiz", "mental sağlık", "bağışıklık"],
    };
    const list = topics[niche] || topics.fitness;
    return list[Math.floor(Math.random() * list.length)];
};

interface GeneratedContent {
    scripts: { hook: string; body: string; callToAction: string; }[];
    onScreenText: { timing: string; text: string; }[];
    visualPrompt: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GeneratorPage() {
    // Form state
    const [niche, setNiche] = useState("");
    const [videoStyle, setVideoStyle] = useState("");
    const [tone, setTone] = useState("");
    const [wordCount, setWordCount] = useState("50-80");
    const [topic, setTopic] = useState("");

    // UI state
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Username modal state
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [usernameLoading, setUsernameLoading] = useState(false);

    // Animation state
    const [isAnimating, setIsAnimating] = useState(false);

    const { generationsToday, incrementGenerations, user, username, isAdmin, loading, isPro, signOut, updateUsername, isUsernameAvailable } = useAuth();
    const router = useRouter();

    // Route protection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    // Check if user needs to set username
    useEffect(() => {
        if (!loading && user && !username) {
            setShowUsernameModal(true);
        }
    }, [user, loading, username]);

    // Handle username submission
    const handleUsernameSubmit = async () => {
        setUsernameError("");

        // Validation
        if (newUsername.length < 3) {
            setUsernameError("En az 3 karakter olmalı");
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            setUsernameError("Sadece harf, rakam ve alt çizgi kullanın");
            return;
        }

        try {
            setUsernameLoading(true);
            const available = await isUsernameAvailable(newUsername);
            if (!available) {
                setUsernameError("Bu kullanıcı adı zaten kullanılıyor");
                return;
            }
            await updateUsername(newUsername);
            setShowUsernameModal(false);
        } catch (err: any) {
            setUsernameError(err.message || "Bir hata oluştu");
        } finally {
            setUsernameLoading(false);
        }
    };

    // Step validation
    const canProceed = (s: number) => {
        if (s === 1) return !!niche;
        if (s === 2) return !!videoStyle;
        if (s === 3) return !!tone;
        if (s === 4) return topic.trim().length > 0;
        return false;
    };

    const goNext = () => {
        if (canProceed(step) && step < 4) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step + 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const handleRandomTopic = () => {
        if (niche) setTopic(generateRandomTopic(niche));
    };

    const handleGenerate = async () => {
        if (!niche || !videoStyle || !topic) return;

        const canGenerate = isPro || isAdmin || generationsToday < MAX_FREE_GENERATIONS;
        if (!canGenerate) {
            setShowUpgradeModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    niche, videoStyle, topic, tone, wordCount,
                    language: "tr", userId: user?.uid,
                }),
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            setResult(data);
            await incrementGenerations();

            if (user?.uid && data.scripts) {
                await saveGeneration({
                    userId: user.uid,
                    niche,
                    videoStyle,
                    tone,
                    duration: wordCount,
                    topic,
                    scripts: data.scripts.map((s: any) => ({
                        hook: s.hook || "",
                        body: s.body || "",
                        callToAction: s.callToAction || "",
                    })),
                    onScreenText: data.onScreenText || [],
                    visualPrompt: data.visualPrompt || "",
                });
            }
        } catch {
            setError("İçerik oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    const selectedNiche = NICHES.find(n => n.value === niche);
    const remainingGenerations = Math.max(0, MAX_FREE_GENERATIONS - generationsToday);

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
            {/* Username Selection Modal - Blocks usage until username is set */}
            <Dialog open={showUsernameModal} onOpenChange={() => { }}>
                <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            Hoş Geldin! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-center text-white/60 mt-2">
                            ViralHook'u kullanmadan önce bir kullanıcı adı seçmelisin
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm text-white/70 mb-2 block">Kullanıcı Adı</label>
                            <Input
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                placeholder="ornek_isim"
                                className="bg-white/5 border-white/10 text-white"
                                disabled={usernameLoading}
                            />
                            <p className="text-xs text-white/40 mt-1">
                                Sadece küçük harf, rakam ve alt çizgi (_) kullanılabilir
                            </p>
                            {usernameError && (
                                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {usernameError}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleUsernameSubmit}
                            disabled={usernameLoading || newUsername.length < 3}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                        >
                            {usernameLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Kullanıcı Adını Kaydet
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all group-hover:scale-105">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            HookAI
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Credits Badge */}
                        {!isPro && !isAdmin && (
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-white/80">
                                    <span className="font-bold text-cyan-400">{remainingGenerations}</span>
                                    <span className="text-white/50"> / {MAX_FREE_GENERATIONS}</span>
                                </span>
                            </div>
                        )}

                        {isPro && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none">
                                <Crown className="w-3 h-3 mr-1" /> PRO
                            </Badge>
                        )}

                        {/* CEO badge for super admin */}
                        {user?.email === "widrivite@gmail.com" && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                                </svg>
                                CEO
                            </Badge>
                        )}

                        {/* ADMIN badge for other admins */}
                        {isAdmin && user?.email !== "widrivite@gmail.com" && (
                            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                                ADMIN
                            </Badge>
                        )}

                        {/* Username Display */}
                        {username && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                    {username[0].toUpperCase()}
                                </div>
                                <span className="text-sm text-white/80 font-medium">@{username}</span>
                            </div>
                        )}

                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                                <Home className="w-4 h-4" />
                            </Button>
                        </Link>

                        {/* Logout Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                await signOut();
                                router.push('/');
                            }}
                            className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    {STEPS.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <button
                                onClick={() => canProceed(s.num - 1) || s.num <= step ? setStep(s.num) : null}
                                disabled={!canProceed(s.num - 1) && s.num > step}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-500
                                    ${step === s.num
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                                        : step > s.num
                                            ? 'bg-white/5 border border-white/20'
                                            : 'bg-white/5 border border-white/5 opacity-50'
                                    }
                                `}
                            >
                                <span className={`text-lg ${step >= s.num ? '' : 'grayscale'}`}>{s.icon}</span>
                                <span className={`text-sm font-medium hidden sm:block ${step === s.num ? 'text-white' : 'text-white/60'}`}>
                                    {s.title}
                                </span>
                                {step > s.num && (
                                    <Check className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 bg-cyan-500/20 rounded-full p-0.5" />
                                )}
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`w-8 h-0.5 mx-2 rounded-full transition-all duration-500 ${step > s.num ? 'bg-cyan-500/50' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Selections Breadcrumb */}
                {(niche || videoStyle || tone) && (
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-8 animate-in fade-in duration-300">
                        {niche && (
                            <>
                                <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${selectedNiche?.color} text-white text-sm font-medium flex items-center gap-1.5 shadow-lg`}>
                                    <span>{selectedNiche?.emoji}</span>
                                    <span>{selectedNiche?.label}</span>
                                </div>
                            </>
                        )}
                        {videoStyle && (
                            <>
                                <ChevronRight className="w-4 h-4 text-white/30" />
                                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium flex items-center gap-1.5">
                                    <span>{VIDEO_STYLES.find(v => v.value === videoStyle)?.emoji}</span>
                                    <span>{VIDEO_STYLES.find(v => v.value === videoStyle)?.label}</span>
                                </div>
                            </>
                        )}
                        {tone && (
                            <>
                                <ChevronRight className="w-4 h-4 text-white/30" />
                                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium flex items-center gap-1.5">
                                    <span>{TONES.find(t => t.value === tone)?.emoji}</span>
                                    <span>{TONES.find(t => t.value === tone)?.label}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step Content */}
                <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

                    {/* Step 1: Niche Selection */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                    İçerik Nişini Seç
                                </h1>
                                <p className="text-white/50 max-w-md mx-auto">
                                    Hangi alanda içerik üretmek istiyorsun?
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {NICHES.map((n) => {
                                    const isLocked = !n.free && !isPro && !isAdmin;
                                    const isSelected = niche === n.value;

                                    return (
                                        <button
                                            key={n.key}
                                            onClick={() => isLocked ? setShowUpgradeModal(true) : setNiche(n.value)}
                                            className={`
                                                group relative p-4 rounded-2xl border transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-gradient-to-br ' + n.color + ' border-white/30 shadow-lg scale-[1.02]'
                                                    : isLocked
                                                        ? 'bg-white/5 border-white/10 opacity-60 hover:opacity-80'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                                                }
                                            `}
                                        >
                                            <div className="text-center">
                                                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                                                    {n.emoji}
                                                </span>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                    {n.label}
                                                </span>
                                            </div>

                                            {isLocked && (
                                                <div className="absolute top-2 right-2">
                                                    <Lock className="w-3 h-3 text-white/40" />
                                                </div>
                                            )}

                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Video Style */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedNiche?.color}`} />
                                    <span className="text-sm text-white/60">{selectedNiche?.label}</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                    Video Stilini Seç
                                </h1>
                                <p className="text-white/50 max-w-md mx-auto">
                                    Nasıl bir içerik formatı kullanmak istiyorsun?
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {VIDEO_STYLES.map((vs) => {
                                    const isSelected = videoStyle === vs.value;

                                    return (
                                        <button
                                            key={vs.key}
                                            onClick={() => setVideoStyle(vs.value)}
                                            className={`
                                                group p-5 rounded-2xl border transition-all duration-300 text-left
                                                ${isSelected
                                                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }
                                            `}
                                        >
                                            <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                                                {vs.emoji}
                                            </span>
                                            <h3 className="font-semibold text-white mb-1">{vs.label}</h3>
                                            <p className="text-sm text-white/60">{vs.desc}</p>

                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tone & Word Count */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                    Ton & Uzunluk
                                </h1>
                                <p className="text-white/50 max-w-md mx-auto">
                                    İçeriğin havası ve uzunluğu
                                </p>
                            </div>

                            {/* Tone Selection */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-white/60 text-center">Anlatım Tonu</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {TONES.map((t) => {
                                        const isSelected = tone === t.value;

                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setTone(t.value)}
                                                className={`
                                                    group p-4 rounded-xl border transition-all duration-300 text-left
                                                    ${isSelected
                                                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                    }
                                                `}
                                            >
                                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                                                    {t.emoji}
                                                </span>
                                                <h4 className="font-semibold text-white mb-1">{t.label}</h4>
                                                <p className="text-xs text-white/50 leading-relaxed">{t.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Word Count Selection */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-white/60 text-center">Script Uzunluğu</h3>
                                <div className="flex justify-center gap-4">
                                    {WORD_COUNTS.map((wc) => {
                                        const isSelected = wordCount === wc.value;

                                        return (
                                            <button
                                                key={wc.value}
                                                onClick={() => setWordCount(wc.value)}
                                                className={`
                                                    px-6 py-3 rounded-xl border transition-all duration-300
                                                    ${isSelected
                                                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }
                                                `}
                                            >
                                                <div className="text-sm font-semibold text-white">{wc.label}</div>
                                                <div className="text-xs text-white/50">{wc.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Topic */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                    Konunu Yaz
                                </h1>
                                <p className="text-white/50 max-w-md mx-auto">
                                    Ne hakkında içerik oluşturmak istiyorsun?
                                </p>
                            </div>

                            {/* Topic Input */}
                            <div className="max-w-xl mx-auto space-y-4">
                                <div className="relative">
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Örn: Sabah rutini ile verimlilik artırma"
                                        className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRandomTopic}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-cyan-400 hover:bg-cyan-500/10"
                                    >
                                        <Shuffle className="w-4 h-4 mr-1" />
                                        Rastgele
                                    </Button>
                                </div>

                                {/* Summary Card */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                    <h4 className="text-sm font-medium text-white/60">Özet</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNiche && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${selectedNiche.color} text-white`}>
                                                {selectedNiche.emoji} {selectedNiche.label}
                                            </span>
                                        )}
                                        {videoStyle && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                                                {VIDEO_STYLES.find(v => v.value === videoStyle)?.emoji} {VIDEO_STYLES.find(v => v.value === videoStyle)?.label}
                                            </span>
                                        )}
                                        {tone && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                                                {TONES.find(t => t.value === tone)?.emoji} {TONES.find(t => t.value === tone)?.label}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                                            📝 {wordCount} kelime
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12">
                    <Button
                        variant="ghost"
                        onClick={goBack}
                        disabled={step === 1}
                        className={`text-white/60 hover:text-white hover:bg-white/10 ${step === 1 ? 'invisible' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Geri
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={goNext}
                            disabled={!canProceed(step)}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            İleri
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleGenerate}
                            disabled={!canProceed(4) || isLoading}
                            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white px-8 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Oluşturuluyor...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-4 h-4 mr-2" />
                                    Oluştur
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <ResultsDisplay content={result} language="tr" />
                    </div>
                )}
            </main>

            {/* Upgrade Modal */}
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <DialogContent className="sm:max-w-md bg-[#0f0f18] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Crown className="w-6 h-6 text-amber-400" />
                            Pro'ya Yükselt
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Tüm nişlere ve sınırsız üretim hakkına eriş
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            {["Tüm 16 niş kategorisi", "Sınırsız içerik üretimi", "Öncelikli destek", "Gelecek özellikler"].map((f) => (
                                <div key={f} className="flex items-center gap-2 text-white/80">
                                    <Check className="w-4 h-4 text-cyan-400" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold h-12">
                            <Crown className="w-5 h-5 mr-2" />
                            Pro'ya Geç - ₺99/ay
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
