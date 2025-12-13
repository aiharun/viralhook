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
    Lightbulb, Shuffle, Zap, FileText, Video, ChevronRight, ChevronLeft, Target, Users
} from "lucide-react";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { useAuth, MAX_FREE_GENERATIONS } from "@/contexts/AuthContext";
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
    { key: "funny", value: "funny", emoji: "😂", label: "Komik", desc: "Güldürürken değer katan içerik" },
    { key: "serious", value: "serious", emoji: "🎯", label: "Ciddi", desc: "Doğrudan, güvenilir bilgi" },
    { key: "dramatic", value: "dramatic", emoji: "🎭", label: "Dramatik", desc: "Duygusal, hikaye odaklı" },
    { key: "casual", value: "casual", emoji: "😎", label: "Rahat", desc: "Arkadaşça, samimi anlatım" },
    { key: "professional", value: "professional", emoji: "👔", label: "Profesyonel", desc: "Uzman, otoriter ton" },
    { key: "edgy", value: "edgy", emoji: "🔥", label: "Cesur", desc: "Provokatif, dikkat çekici" },
];

// Dynamic topic generator based on niche - Simple short topics
const generateRandomTopic = (niche: string): string => {
    const topicsByNiche: Record<string, string[]> = {
        fitness: [
            "sabah egzersiz rutini",
            "evde karın kası antrenmanı",
            "kilo verme ipuçları",
            "protein alımı",
            "yağ yakma teknikleri",
            "kas yapma süreci",
            "antrenman motivasyonu",
            "sağlıklı beslenme",
            "esneklik egzersizleri",
            "koşu performansı"
        ],
        finance: [
            "bütçe yönetimi",
            "tasarruf yöntemleri",
            "yatırım başlangıcı",
            "borç ödeme stratejisi",
            "pasif gelir kaynakları",
            "kripto para temelleri",
            "emeklilik planlaması",
            "vergi avantajları",
            "acil durum fonu",
            "finansal özgürlük"
        ],
        relationships: [
            "sağlıklı iletişim",
            "güven inşa etme",
            "ilk buluşma ipuçları",
            "uzun mesafe ilişkiler",
            "tartışma çözme",
            "sevgi dili keşfi",
            "toksin ilişki işaretleri",
            "kendini sevme",
            "evlilik hazırlığı",
            "flört önerileri"
        ],
        food: [
            "kolay yemek tarifleri",
            "15 dakikalık yemekler",
            "sağlıklı atıştırmalıklar",
            "kahvaltı fikirleri",
            "meal prep ipuçları",
            "protein dolu tarifler",
            "düşük kalorili tatlılar",
            "bir tencerede yemek",
            "vegan alternatifler",
            "mutfak hileleri"
        ],
        beauty: [
            "cilt bakım rutini",
            "makyaj temelleri",
            "saç bakım ipuçları",
            "doğal güzellik",
            "anti-aging önerileri",
            "göz makyajı teknikleri",
            "günlük makyaj",
            "cilt problemleri",
            "nemlendiriciler",
            "güneş koruma"
        ],
        tech: [
            "iPhone gizli özellikleri",
            "verimlilik uygulamaları",
            "sosyal medya ipuçları",
            "teknoloji haberleri",
            "yapay zeka araçları",
            "fotoğraf düzenleme",
            "telefon aksesuar önerileri",
            "bilgisayar hızlandırma",
            "siber güvenlik",
            "akıllı ev sistemleri"
        ],
        motivation: [
            "sabah rutini",
            "hedef belirleme",
            "kötü alışkanlıkları bırakma",
            "öz disiplin",
            "zaman yönetimi",
            "stres yönetimi",
            "özgüven artırma",
            "erteleme sorunu",
            "başarı mindset",
            "pozitif düşünce"
        ],
        travel: [
            "ucuz seyahat ipuçları",
            "valiz hazırlama",
            "gizli cennetler",
            "solo seyahat",
            "uçak bileti hileleri",
            "konaklama önerileri",
            "yerel deneyimler",
            "seyahat fotğrafçılığı",
            "vize işlemleri",
            "backpacking"
        ],
        gaming: [
            "oyun tavsiyeleri",
            "strateji ipuçları",
            "setup turu",
            "oyun incelemeleri",
            "e-spor haberleri",
            "gaming ekipman",
            "oyun hikayeleri",
            "multiplayer taktikleri",
            "yeni çıkan oyunlar",
            "retro gaming"
        ]
    };

    const topics = topicsByNiche[niche] || [
        "gündem konusu",
        "ilginç bilgiler",
        "hayat ipuçları",
        "kişisel deneyimler",
        "içerik önerileri"
    ];

    return topics[Math.floor(Math.random() * topics.length)];
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

    // Advanced inputs for better hook generation
    const [targetAudience, setTargetAudience] = useState("");
    const [painPoint, setPainPoint] = useState("");
    const [uniqueValue, setUniqueValue] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratedContent | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedScript, setSelectedScript] = useState<number | null>(null);

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
        const randomTopic = generateRandomTopic(niche);
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
                    userId: user?.uid,
                    // Advanced targeting for better hooks
                    targetAudience,
                    painPoint,
                    uniqueValue
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

    const selectedNiche = NICHES.find(n => n.value === niche);
    const canGenerate = niche && videoStyle && topic.trim().length > 0;

    // Explicit wizard step (user controlled)
    const [wizardStep, setWizardStep] = useState(1);

    // Check if current step is complete (can proceed)
    const canProceed =
        (wizardStep === 1 && niche) ||
        (wizardStep === 2 && videoStyle) ||
        (wizardStep === 3 && tone) ||
        (wizardStep === 4 && topic.trim().length > 0);

    const STEPS = [
        { num: 1, title: "Niş Seçimi", desc: "İçerik kategorinizi seçin", tip: "📌 Hangi alanda içerik oluşturuyorsunuz? Bu, hook'larınızın o alana özel olmasını sağlar." },
        { num: 2, title: "Video Stili", desc: "Video formatınızı belirleyin", tip: "🎥 Videonuz hikaye mi? Eğitici mi? Satış mı? Her stil farklı hook stratejisi gerektirir." },
        { num: 3, title: "Ton Seçimi", desc: "Anlatım tarzınızı seçin", tip: "🎭 İçeriğinizin havası ne olacak? Tonunuz kitlenizin duygusal tepkisini belirler." },
        { num: 4, title: "Konu & Detaylar", desc: "Spesifik konunuzu girin", tip: "💡 Ne hakkında konuşacaksınız? Spesifik olun! 'Kilo verme' yerine '30 günde 5 kilo' gibi." },
    ];

    const goNext = () => {
        if (canProceed && wizardStep < 4) {
            setWizardStep(wizardStep + 1);
        }
    };

    const goBack = () => {
        if (wizardStep > 1) {
            setWizardStep(wizardStep - 1);
        }
    };

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
                <div className="text-center mb-8">
                    <Badge className="mb-4 gradient-primary text-black font-medium">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        AI Destekli
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                        Viral İçerik Üret
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Adım adım ilerleyin - AI sizin için scroll-durdurucu hooklar oluştursun
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className={`
                                    flex flex-col items-center
                                    ${wizardStep >= step.num ? 'opacity-100' : 'opacity-40'}
                                `}>
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                        ${wizardStep > step.num
                                            ? 'bg-green-500 text-white'
                                            : wizardStep === step.num
                                                ? 'gradient-primary text-black ring-4 ring-cyan-500/30'
                                                : 'bg-white/10 text-white/50'
                                        }
                                    `}>
                                        {wizardStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium hidden sm:block ${wizardStep >= step.num ? 'text-white' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${wizardStep > step.num ? 'bg-green-500' : 'bg-white/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Current Step Tip Card */}
                    <div className="glass rounded-2xl p-4 border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Adım {wizardStep}: {STEPS[wizardStep - 1].title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {STEPS[wizardStep - 1].tip}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wizard Step Content with Selection Summary */}
                <div className="max-w-5xl mx-auto mb-8 grid md:grid-cols-3 gap-6">
                    {/* Main Wizard Content - Left Side */}
                    <div className="md:col-span-2">
                        {/* Step 1: Niche */}
                        {wizardStep === 1 && (
                            <div className="glass rounded-2xl p-6 transition-all">
                                <Label className="text-lg font-bold text-white mb-4 block">
                                    📌 İçerik Nişinizi Seçin
                                </Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Hangi alanda içerik oluşturuyorsunuz? Bu seçim hook'larınızın o alana özel olmasını sağlar.
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-1">
                                    {NICHES.map((n) => {
                                        const isLocked = !isPro && !isAdmin && !n.free;
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
                                                relative p-3 rounded-xl text-center transition-all
                                                ${isSelected && !isLocked
                                                        ? `bg-gradient-to-r ${n.color} text-white shadow-lg ring-2 ring-white/30`
                                                        : isLocked
                                                            ? "bg-white/5 hover:bg-white/10 text-muted-foreground cursor-pointer"
                                                            : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                                    }
                                            `}
                                            >
                                                {isLocked && (
                                                    <div className="absolute top-1 right-1">
                                                        <Lock className="w-3 h-3 text-purple-400" />
                                                    </div>
                                                )}
                                                <span className="text-2xl block">{n.emoji}</span>
                                                <span className={`text-xs block mt-1 font-medium ${isLocked ? "text-purple-400" : ""}`}>
                                                    {n.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Video Style */}
                        {wizardStep === 2 && (
                            <div className="glass rounded-2xl p-6 transition-all">
                                <Label className="text-lg font-bold text-white mb-4 block">
                                    🎬 Video Stilinizi Seçin
                                </Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Videonuz nasıl bir format olacak? Her stil farklı hook stratejisi gerektirir.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {VIDEO_STYLES.map((s) => (
                                        <button
                                            key={s.key}
                                            onClick={() => !isLoading && setVideoStyle(s.value)}
                                            disabled={isLoading}
                                            className={`p-4 rounded-xl flex items-center gap-3 transition-all ${videoStyle === s.value
                                                ? "gradient-accent text-white shadow-lg ring-2 ring-purple-400/50"
                                                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                                }`}
                                        >
                                            <span className="text-2xl">{s.emoji}</span>
                                            <div className="text-left">
                                                <span className="text-sm font-semibold block">{s.label}</span>
                                                <span className="text-xs opacity-70">{s.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Tone & Duration */}
                        {wizardStep === 3 && (
                            <div className="glass rounded-2xl p-6 transition-all">
                                <Label className="text-lg font-bold text-white mb-4 block">
                                    🎭 Ton & Süre Seçin
                                </Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    İçeriğinizin havası nasıl olsun? Süre platformunuza göre seçin.
                                </p>

                                <div className="mb-6">
                                    <Label className="text-sm font-semibold text-white mb-3 block">Ton</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {TONES.map((t) => (
                                            <button
                                                key={t.key}
                                                onClick={() => !isLoading && setTone(t.value)}
                                                disabled={isLoading}
                                                className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${tone === t.value
                                                    ? "gradient-primary text-black shadow-lg ring-2 ring-cyan-400/50"
                                                    : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                                    }`}
                                            >
                                                <span className="text-2xl">{t.emoji}</span>
                                                <span className="text-xs font-bold">{t.label}</span>
                                                <span className={`text-[10px] text-center leading-tight ${tone === t.value ? 'text-black/70' : 'opacity-60'}`}>{t.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold text-white mb-3 block">⏱️ Video Süresi</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: "30", label: "30 saniye", desc: "Kısa & vurucu" },
                                            { value: "60", label: "60 saniye", desc: "Standart" },
                                            { value: "90", label: "90 saniye", desc: "Detaylı" }
                                        ].map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => !isLoading && setDuration(d.value)}
                                                disabled={isLoading}
                                                className={`p-4 rounded-xl transition-all ${duration === d.value
                                                    ? "bg-white text-black shadow-lg"
                                                    : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                                                    }`}
                                            >
                                                <span className="text-lg font-bold block">{d.value}s</span>
                                                <span className="text-xs opacity-70">{d.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Topic & Advanced */}
                        {wizardStep === 4 && (
                            <div className="glass rounded-2xl p-6 transition-all">
                                <Label className="text-lg font-bold text-white mb-4 block">
                                    ✍️ Konu & Detaylar
                                </Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Spesifik olun! "Kilo verme" yerine "30 günde 5 kilo verme yolculuğum" gibi.
                                </p>

                                <div className="space-y-4 mb-6">
                                    <Input
                                        placeholder="Videonuzun konusu nedir?"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-14 text-lg"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300"
                                        onClick={handleRandomTopic}
                                        disabled={!niche || isLoading}
                                    >
                                        <Shuffle className="w-4 h-4 mr-2" />
                                        AI Konu Öner
                                    </Button>
                                </div>

                                {/* Advanced Targeting (Optional) */}
                                <div className="border-t border-white/10 pt-6">
                                    <Label className="text-sm font-semibold text-purple-400 mb-4 block flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Gelişmiş Hedefleme (Opsiyonel)
                                    </Label>
                                    <div className="grid gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Hedef Kitle</Label>
                                            <Input
                                                placeholder="örn: 18-25 yaş, üniversite öğrencileri"
                                                value={targetAudience}
                                                onChange={(e) => setTargetAudience(e.target.value)}
                                                disabled={isLoading}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Problem / Acı Noktası</Label>
                                            <Input
                                                placeholder="örn: zaman yönetimi sorunu"
                                                value={painPoint}
                                                onChange={(e) => setPainPoint(e.target.value)}
                                                disabled={isLoading}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Benzersiz Değer</Label>
                                            <Input
                                                placeholder="örn: 3 yıllık tecrübe"
                                                value={uniqueValue}
                                                onChange={(e) => setUniqueValue(e.target.value)}
                                                disabled={isLoading}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-6 gap-4">
                            <Button
                                variant="outline"
                                onClick={goBack}
                                disabled={wizardStep === 1}
                                className={`px-6 py-5 ${wizardStep === 1 ? 'invisible' : ''}`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Geri
                            </Button>

                            {wizardStep < 4 ? (
                                <Button
                                    onClick={goNext}
                                    disabled={!canProceed}
                                    className="px-8 py-5 gradient-primary text-black font-bold shadow-lg shadow-cyan-500/30"
                                >
                                    İleri
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="px-12 py-6 text-lg font-bold gradient-primary text-black hover:opacity-90 disabled:opacity-50 glow-cyan shadow-xl shadow-cyan-500/30"
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
                                            Hook Üret
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Selection Summary - Right Sidebar */}
                    <div className="md:col-span-1">
                        <div className="glass rounded-2xl p-5 sticky top-24">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                Seçimleriniz
                            </h3>
                            <div className="space-y-3">
                                {/* Niche */}
                                <div className={`p-3 rounded-xl transition-all ${niche ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5 border border-white/10'}`}>
                                    <p className="text-[10px] text-muted-foreground mb-1">📌 Niş</p>
                                    {niche ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{NICHES.find(n => n.value === niche)?.emoji}</span>
                                            <span className="text-sm font-medium text-white">{NICHES.find(n => n.value === niche)?.label}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Seçilmedi</p>
                                    )}
                                </div>

                                {/* Video Style */}
                                <div className={`p-3 rounded-xl transition-all ${videoStyle ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5 border border-white/10'}`}>
                                    <p className="text-[10px] text-muted-foreground mb-1">🎬 Video Stili</p>
                                    {videoStyle ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{VIDEO_STYLES.find(s => s.value === videoStyle)?.emoji}</span>
                                            <span className="text-sm font-medium text-white">{VIDEO_STYLES.find(s => s.value === videoStyle)?.label}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Seçilmedi</p>
                                    )}
                                </div>

                                {/* Tone */}
                                <div className={`p-3 rounded-xl transition-all ${tone ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-white/5 border border-white/10'}`}>
                                    <p className="text-[10px] text-muted-foreground mb-1">🎭 Ton</p>
                                    {tone ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{TONES.find(t => t.value === tone)?.emoji}</span>
                                            <span className="text-sm font-medium text-white">{TONES.find(t => t.value === tone)?.label}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Seçilmedi</p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-muted-foreground mb-1">⏱️ Süre</p>
                                    <p className="text-sm font-medium text-white">{duration} saniye</p>
                                </div>

                                {/* Topic */}
                                <div className={`p-3 rounded-xl transition-all ${topic ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                                    <p className="text-[10px] text-muted-foreground mb-1">✍️ Konu</p>
                                    {topic ? (
                                        <p className="text-sm font-medium text-white line-clamp-2">{topic}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Girilmedi</p>
                                    )}
                                </div>

                                {/* Advanced Targeting (if any) */}
                                {(targetAudience || painPoint || uniqueValue) && (
                                    <div className="pt-3 border-t border-white/10">
                                        <p className="text-[10px] text-purple-400 mb-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Gelişmiş Hedefleme
                                        </p>
                                        {targetAudience && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                👤 <span className="text-white/80">{targetAudience}</span>
                                            </p>
                                        )}
                                        {painPoint && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                💢 <span className="text-white/80">{painPoint}</span>
                                            </p>
                                        )}
                                        {uniqueValue && (
                                            <p className="text-xs text-muted-foreground">
                                                ✨ <span className="text-white/80">{uniqueValue}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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
                            {/* Premium Loading Spinner */}
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-spin" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-1 rounded-full bg-background" />
                                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse" />
                                <Sparkles className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">AI Çalışıyor...</h3>
                            <p className="text-muted-foreground">Viral hook'lar oluşturuluyor</p>
                            <div className="flex items-center gap-1 mt-4">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    ) : result ? (
                        <ResultsDisplay
                            content={result}
                            language="tr"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            {/* Premium Empty State Icons */}
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-transform">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-transform">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30 transform hover:scale-105 transition-transform">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Sonuçlar Burada Görünecek</h3>
                            <p className="text-muted-foreground max-w-md leading-relaxed">
                                Yukarıdan niş, stil, ton ve konu seçip <span className="text-cyan-400 font-medium">Hook Üret</span> butonuna tıklayın
                            </p>
                        </div>
                    )}
                </div>
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
