"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Rocket, Sparkles, Loader2, Crown, Lock, Check, AlertCircle,
    Lightbulb, Shuffle, Zap, FileText, Video, ChevronRight, Target, Users
} from "lucide-react";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { useAuth, MAX_FREE_GENERATIONS } from "@/contexts/AuthContext";
import AnalysisModal from "@/components/AnalysisModal";
import { saveGeneration } from "@/lib/scriptService";

const NICHES = [
    // Free niches (4)
    { key: "fitness", value: "fitness", emoji: "💪", label: "Fitness", color: "from-red-500 to-orange-500", free: true },
    { key: "finance", value: "finance", emoji: "💰", label: "Finans", color: "from-green-500 to-emerald-500", free: true },
    { key: "food", value: "food", emoji: "🍕", label: "Yemek", color: "from-yellow-500 to-orange-500", free: true },
    { key: "relationships", value: "relationships", emoji: "❤️", label: "İlişkiler", color: "from-rose-500 to-pink-500", free: true },

    // Pro niches (12)
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
    { key: "storytelling", value: "storytelling", emoji: "📖", label: "Hikaye Anlatımı", desc: "Kişisel deneyim" },
    { key: "hardSales", value: "hard sales", emoji: "🎯", label: "Satış Odaklı", desc: "Ürün tanıtımı" },
    { key: "reaction", value: "reaction/duet", emoji: "🎭", label: "Tepki/Duet", desc: "Trendlere tepki" },
    { key: "educational", value: "educational/how-to", emoji: "🎓", label: "Eğitici", desc: "Nasıl yapılır" },
    { key: "controversy", value: "controversy", emoji: "🔥", label: "Tartışmalı", desc: "Cesur fikirler" },
    { key: "motivation", value: "motivation", emoji: "💪", label: "Motivasyon", desc: "İlham verici" },
    { key: "behindScenes", value: "behind scenes", emoji: "🎬", label: "Kamera Arkası", desc: "Sahne arkası" },
    { key: "transformation", value: "transformation", emoji: "✨", label: "Dönüşüm", desc: "Önce/Sonra" },
];

const TONES = [
    { key: "funny", value: "funny", emoji: "😂", label: "Komik" },
    { key: "serious", value: "serious", emoji: "🎯", label: "Ciddi" },
    { key: "dramatic", value: "dramatic", emoji: "🎭", label: "Dramatik" },
    { key: "casual", value: "casual", emoji: "😎", label: "Rahat" },
    { key: "professional", value: "professional", emoji: "👔", label: "Profesyonel" },
    { key: "edgy", value: "edgy", emoji: "🔥", label: "Cesur" },
];

// Dynamic topic generator based on niche, style, and tone
const generateRandomTopic = (niche: string, style: string, tone: string): string => {
    const topicTemplates: Record<string, Record<string, string[]>> = {
        fitness: {
            storytelling: [
                "kilo verme yolculuğum ve öğrendiğim 5 ders",
                "spor salonunda yaşadığım en utanç verici an",
                "3 ayda vücut dönüşümümün hikayesi",
                "antrenmanı bırakıp geri döndüğümde neler değişti"
            ],
            "hard sales": [
                "bu protein tozu neden rakiplerinden farklı",
                "kullandığım fitness uygulaması hayatımı değiştirdi",
                "bu ekipman olmadan antrenman yapmıyorum"
            ],
            "reaction/duet": [
                "TikTok'taki fitness tavsiyelerine tepkim",
                "influencer'ların gizlediği gerçekler",
                "gerçek vs sahte fitness dönüşümleri"
            ],
            "educational/how-to": [
                "evde 15 dakikada karın kası nasıl yapılır",
                "yeni başlayanlar için doğru squat tekniği",
                "metabolizmayı hızlandırmanın 5 yolu"
            ],
            controversy: [
                "personal trainer'ınız size yalan söylüyor",
                "kardiyo aslında kilo verdirmiyor",
                "protein ihtiyacınız sandığınız kadar değil"
            ]
        },
        finance: {
            storytelling: [
                "borçtan nasıl kurtuldum hikayem",
                "ilk 100.000 TL'yi nasıl biriktirdim",
                "yatırım hatalarım ve öğrendiklerim"
            ],
            "hard sales": [
                "kullandığım yatırım uygulaması",
                "bu kredi kartı size para kazandırıyor"
            ],
            "educational/how-to": [
                "bütçe yapmanın kolay yolu",
                "acil durum fonu nasıl oluşturulur",
                "ilk yatırımınızı nasıl yaparsınız"
            ],
            controversy: [
                "bankalar sizi nasıl soyuyor",
                "emeklilik sistemi neden çöküyor",
                "zenginlerin bildiği vergi sırları"
            ]
        },
        relationships: {
            storytelling: [
                "eşimle nasıl tanıştık hikayesi",
                "ayrılık sürecinde öğrendiklerim",
                "uzun mesafe ilişkimiz nasıl işliyor"
            ],
            controversy: [
                "modern flört neden bu kadar zor",
                "herkesin görmezden geldiği red flag'ler",
                "neden kimse gerçek hislerini söylemiyor"
            ],
            "educational/how-to": [
                "iletişimi güçlendirmenin yolları",
                "tartışmaları nasıl çözersiniz",
                "güven nasıl yeniden inşa edilir"
            ]
        },
        comedy: {
            storytelling: [
                "başıma gelen en utanç verici olay",
                "aileme itiraf edemediğim şeyler",
                "işten neredeyse kovuluyordum"
            ],
            "reaction/duet": [
                "cringe videolara tepkim",
                "anne babamın eski fotoğraflarına tepkim"
            ]
        },
        tech: {
            "educational/how-to": [
                "telefonunuzu hızlandırmanın 5 yolu",
                "kimsenin bilmediği iPhone ayarları",
                "internette güvenliğinizi koruma rehberi"
            ],
            controversy: [
                "Apple sizi nasıl kandırıyor",
                "sosyal medya beyninizi nasıl etkiliyor",
                "yapay zeka işlerimizi alacak mı"
            ]
        },
        education: {
            "educational/how-to": [
                "sınava daha verimli çalışma yöntemleri",
                "herhangi bir dili 3 ayda öğrenin",
                "not alma teknikleri"
            ],
            controversy: [
                "okul sistemi neden başarısız",
                "üniversite artık gerekli mi"
            ]
        },
        crypto: {
            controversy: [
                "bu altcoin 10x yapabilir",
                "Bitcoin neden 100.000 dolara çıkacak",
                "kripto dolandırıcılıklarını nasıl anlarsınız"
            ],
            storytelling: [
                "kripto'da her şeyimi nasıl kaybettim",
                "ilk Bitcoin'imi aldığım gün"
            ]
        },
        beauty: {
            "educational/how-to": [
                "günlük makyaj rutini 10 dakikada",
                "cilt bakımında yaptığınız hatalar",
                "saç bakım sırlarım"
            ],
            storytelling: [
                "cilt problemlerimi nasıl çözdüm",
                "makyaj yolculuğum"
            ]
        },
        food: {
            "educational/how-to": [
                "evde restoran kalitesinde yemek yapma",
                "hızlı ve sağlıklı yemek tarifleri"
            ],
            storytelling: [
                "mutfakta yaşadığım en büyük felaket"
            ]
        },
        travel: {
            storytelling: [
                "en kötü seyahat deneyimim",
                "bu şehir beklentilerimi aştı"
            ],
            "educational/how-to": [
                "ucuz seyahat etmenin sırları",
                "valiz hazırlama rehberi"
            ]
        },
        gaming: {
            "reaction/duet": [
                "bu oyuncu inanılmaz bir hareket yaptı",
                "en çok sinir olduğum oyun anları"
            ],
            storytelling: [
                "oyunculuk kariyerime nasıl başladım"
            ]
        },
        motivation: {
            storytelling: [
                "dipten nasıl çıktım hikayem",
                "başarısızlık beni nasıl güçlendirdi"
            ],
            controversy: [
                "motivasyon videoları sizi kandırıyor",
                "başarı sırları kimsenin söylemediği"
            ]
        }
    };

    // Get topics for selected niche and style
    const nicheTopics = topicTemplates[niche];
    let topics: string[] = [];

    if (nicheTopics) {
        if (nicheTopics[style]) {
            topics = nicheTopics[style];
        } else {
            // Fallback to any available style for this niche
            topics = Object.values(nicheTopics).flat();
        }
    }

    // Fallback topics if nothing found
    if (topics.length === 0) {
        topics = [
            "izleyicilerin bilmesi gereken bir şey",
            "deneyimim ve öğrendiklerim",
            "herkesin yaptığı yaygın hatalar",
            "size söylemediğim sırlar",
            "hayatımı değiştiren keşif"
        ];
    }

    // Add tone modifier
    const toneModifiers: Record<string, string[]> = {
        funny: ["(komik versiyonu)", ""],
        dramatic: ["ve sonucu şok edici", "inanılmaz sonuç"],
        professional: ["profesyonel bakış açısı", ""],
        edgy: ["kimse bunu söylemeye cesaret edemiyor", ""],
        casual: ["", ""],
        serious: ["ciddi bir bakış", ""]
    };

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const modifier = toneModifiers[tone]?.[Math.floor(Math.random() * toneModifiers[tone].length)] || "";

    return modifier ? `${randomTopic} ${modifier}` : randomTopic;
};

interface GeneratedContent {
    scripts: { hook: string; body: string; callToAction: string; }[];
    onScreenText: { timing: string; text: string; }[];
    visualPrompt: string;
}

export default function GeneratorPage() {
    const [niche, setNiche] = useState("");
    const [videoStyle, setVideoStyle] = useState("");
    const [tone, setTone] = useState("");
    const [duration, setDuration] = useState("60");
    const [topic, setTopic] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratedContent | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedScript, setSelectedScript] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { generationsToday, incrementGenerations, user, isAdmin, signOut, loading, isPro } = useAuth();
    const router = useRouter();

    // Route protection - redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    const handleRandomTopic = () => {
        if (!niche) return;
        const randomTopic = generateRandomTopic(niche, videoStyle, tone);
        setTopic(randomTopic);
    };

    const handleGenerate = async () => {
        if (!niche || !videoStyle || !topic) return;

        // Admins have unlimited generations
        if (!isAdmin && generationsToday >= MAX_FREE_GENERATIONS) {
            setShowUpgradeModal(true);
            return;
        }

        // Optimistically increment or check limit before calling API? 
        // Better to check limit first (already done above), then call API, then increment.
        // Actually, if we want to be strict, we should reserve logic. 
        // But for this MVP, we increment AFTER success, or we can check via helper.
        // However, the prompt says "her hook oluşturma 1 kredi alsın".
        // Let's rely on the check above.

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    niche,
                    videoStyle,
                    topic,
                    tone,
                    duration,
                    language: "tr",
                    userId: user?.uid
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Üretim başarısız oldu");
                return;
            }

            setResult(data);

            // Consume credit
            await incrementGenerations();

        } catch {
            setError("Ağ hatası. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async (script: { hook: string; body: string }) => {
        try {
            setIsAnalyzing(true);
            setAnalysisResult(null);

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hook: script.hook,
                    body: script.body,
                    niche,
                    videoStyle,
                }),
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const result = await response.json();
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis error:", error);
            setError("Analiz yapılamadı. Lütfen tekrar deneyin.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const selectedNiche = NICHES.find(n => n.value === niche);
    const canGenerate = niche && videoStyle && topic.trim().length > 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),transparent)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_80%_120%,rgba(139,92,246,0.1),transparent)]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5 bg-background/90 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Rocket className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-white">Viral</span>
                                <span className="gradient-text">Hook</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium text-cyan-400">
                                    {isPro || isAdmin ? (
                                        <span className="text-purple-400 font-semibold">Sınırsız ✨</span>
                                    ) : (
                                        `${MAX_FREE_GENERATIONS - generationsToday}/${MAX_FREE_GENERATIONS} Kalan`
                                    )}
                                </span>
                            </div>

                            {!user?.isAnonymous && isAdmin && (
                                <Link href="/admin">
                                    <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
                                        <Crown className="w-4 h-4 mr-1.5 text-purple-400" />
                                        Admin
                                    </Button>
                                </Link>
                            )}

                            {user?.email && (
                                <div className="flex items-center gap-3">
                                    {/* User Email & Plan */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                        <span className="text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                        <Badge
                                            variant={isPro ? "default" : "outline"}
                                            className={isPro
                                                ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                                                : "border-white/30 text-white/70"
                                            }
                                        >
                                            {isPro ? "Pro" : "Free"}
                                        </Badge>
                                    </div>

                                    {/* Upgrade Button (only for free users) */}
                                    {!isPro && (
                                        <Button
                                            onClick={() => setShowUpgradeModal(true)}
                                            size="sm"
                                            className="gradient-accent text-white font-semibold hover:opacity-90"
                                        >
                                            <Crown className="w-3.5 h-3.5 mr-1.5" />
                                            Pro'ya Yükselt
                                        </Button>
                                    )}

                                    {/* Sign Out */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            await signOut();
                                            router.push("/");
                                        }}
                                        className="text-xs hover:bg-white/10"
                                    >
                                        Çıkış Yap
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <Badge className="mb-4 gradient-primary text-black font-medium">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        AI Destekli
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                        Viral İçerik Üret
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Niş, stil ve ton seçin - AI sizin için scroll-durdurucu hooklar oluştursun
                    </p>
                </div>

                {/* Step Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {/* Step 1: Niche */}
                    <div className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-cyan-500/30 z-20">
                            1
                        </div>
                        <div className={`glass rounded-2xl p-5 h-full transition-all relative z-10 ${niche ? 'border-cyan-500/30' : ''}`}>
                            <Label className="text-sm font-semibold text-white mb-3 block">
                                📌 Niş Seçin
                            </Label>
                            <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                                {NICHES.map((n) => {
                                    const isLocked = !isPro && !isAdmin && !n.free; // Admin bypass
                                    const isSelected = niche === n.value;

                                    return (
                                        <button
                                            key={n.key}
                                            onClick={() => {
                                                if (isLocked) {
                                                    setShowUpgradeModal(true);
                                                } else if (!isLoading) {
                                                    setNiche(n.value);
                                                }
                                            }}
                                            disabled={isLoading && !isLocked}
                                            className={`
                                                relative p-2 rounded-xl text-center transition-all
                                                ${isSelected && !isLocked
                                                    ? `bg-gradient-to-r ${n.color} text-white shadow-lg`
                                                    : isLocked
                                                        ? "bg-white/5 hover:bg-white/10 text-muted-foreground cursor-pointer"
                                                        : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                                }
                                                ${isLoading && !isLocked ? "opacity-50 cursor-not-allowed" : ""}
                                            `}
                                        >
                                            {isLocked && (
                                                <div className="absolute top-1 right-1">
                                                    <Lock className="w-3 h-3 text-purple-400" />
                                                </div>
                                            )}
                                            <span className="text-xl block">{n.emoji}</span>
                                            <span className={`text-[10px] block mt-1 font-medium leading-tight ${isLocked ? "text-purple-400" : ""}`}>
                                                {n.label}
                                                {isLocked && <span className="block text-[8px]">Pro</span>}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Video Style */}
                    <div className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-cyan-500/30 z-20">
                            2
                        </div>
                        <div className={`glass rounded-2xl p-5 h-full transition-all relative z-10 ${videoStyle ? 'border-purple-500/30' : ''}`}>
                            <Label className="text-sm font-semibold text-white mb-3 block">
                                🎬 Video Stili
                            </Label>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                {VIDEO_STYLES.map((s) => (
                                    <button
                                        key={s.key}
                                        onClick={() => !isLoading && setVideoStyle(s.value)}
                                        disabled={isLoading}
                                        className={`w-full p-2.5 rounded-xl flex items-center gap-2 transition-all ${videoStyle === s.value
                                            ? "gradient-accent text-white shadow-lg"
                                            : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <span className="text-lg">{s.emoji}</span>
                                        <div className="text-left">
                                            <span className="text-xs font-medium block">{s.label}</span>
                                            <span className="text-[10px] opacity-70">{s.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Tone */}
                    <div className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-cyan-500/30 z-20">
                            3
                        </div>
                        <div className={`glass rounded-2xl p-5 h-full transition-all relative z-10 ${tone ? 'border-pink-500/30' : ''}`}>
                            <Label className="text-sm font-semibold text-white mb-3 block">
                                🎭 Ton & Süre
                            </Label>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {TONES.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => !isLoading && setTone(t.value)}
                                        disabled={isLoading}
                                        className={`p-3 rounded-xl flex items-center gap-2 transition-all ${tone === t.value
                                            ? "gradient-primary text-black shadow-lg"
                                            : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <span className="text-lg">{t.emoji}</span>
                                        <span className="text-xs font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            <Label className="text-xs font-semibold text-white mb-2 block">
                                ⏱️ Süre
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {["30", "60", "90"].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => !isLoading && setDuration(d)}
                                        disabled={isLoading}
                                        className={`p-2 rounded-lg text-xs font-medium transition-all ${duration === d
                                            ? "bg-white text-black"
                                            : "bg-white/5 text-muted-foreground hover:text-white"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {d} sn
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Topic */}
                    <div className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-cyan-500/30 z-20">
                            4
                        </div>
                        <div className={`glass rounded-2xl p-5 h-full transition-all relative z-10 ${topic ? 'border-green-500/30' : ''}`}>
                            <Label className="text-sm font-semibold text-white mb-3 block">
                                ✍️ Konu
                            </Label>

                            <div className="space-y-3">
                                <Input
                                    placeholder="Videonuzun konusu..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white h-12"
                                    disabled={isLoading}
                                />

                                {/* Random Topic Button */}
                                <Button
                                    variant="outline"
                                    className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300"
                                    onClick={handleRandomTopic}
                                    disabled={!niche || isLoading}
                                >
                                    <Shuffle className="w-4 h-4 mr-2" />
                                    AI Konu Öner
                                </Button>

                                {!niche && (
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        Önce niş seçin
                                    </p>
                                )}

                                {niche && videoStyle && (
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        <Target className="w-3 h-3 inline mr-1" />
                                        Seçiminize uygun konu önerilecek
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center mb-12">
                    <Button
                        size="lg"
                        className="px-12 py-7 text-lg font-bold gradient-primary text-black hover:opacity-90 disabled:opacity-50 glow-cyan shadow-xl shadow-cyan-500/30"
                        onClick={handleGenerate}
                        disabled={isLoading || !canGenerate}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                Üretiliyor...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6 mr-3" />
                                Viral İçerik Oluştur
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Hata Oluştu</p>
                                <p className="text-sm opacity-80 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="max-w-5xl mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full gradient-primary animate-pulse" />
                                <Sparkles className="w-10 h-10 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-lg text-white font-medium mb-2">AI çalışıyor...</p>
                            <p className="text-muted-foreground text-sm">Viral hooklar oluşturuluyor</p>
                        </div>
                    ) : result ? (
                        <ResultsDisplay
                            content={result}
                            language="tr"
                            onAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="grid grid-cols-3 gap-4 mb-8 opacity-50">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-cyan-500" />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-purple-500" />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                                    <Video className="w-8 h-8 text-pink-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Sonuçlar burada görünecek</h3>
                            <p className="text-muted-foreground max-w-md">
                                Niş, stil, ton ve konu seçin, ardından oluştur butonuna tıklayın
                            </p>
                        </div>
                    )}
                </div>

                {/* Analysis Modal */}
                <AnalysisModal 
                    open={!!analysisResult}
                    onClose={() => setAnalysisResult(null)}
                    result={analysisResult}
                />
            </main>

            {/* Upgrade Modal */}
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <DialogContent className="sm:max-w-md glass border-white/10">
                    <DialogHeader className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center text-white">
                            Günlük Limitiniz Doldu 🚀
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Bugün için 3 ücretsiz hakkınızı kullandınız. Sınırsız erişim için Pro'ya geçin!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-6 rounded-2xl gradient-primary">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-black text-lg">Pro Plan</span>
                                <Badge className="bg-black/20 text-black">POPÜLER</Badge>
                            </div>
                            <div className="flex items-baseline gap-1 mb-5">
                                <span className="text-4xl font-extrabold text-black">₺149</span>
                                <span className="text-black/60">/ay</span>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Sınırsız üretim",
                                    "Öncelikli AI işleme",
                                    "Script kaydetme",
                                    "Gelişmiş niş hedefleme",
                                    "7/24 destek"
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-black/80">
                                        <Check className="w-5 h-5 text-black shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button className="w-full py-6 bg-white text-black hover:bg-white/90 font-bold text-lg">
                            <Crown className="w-5 h-5 mr-2" />
                            Pro'ya Geç
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Stripe ile güvenli ödeme. İstediğiniz zaman iptal edin.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
