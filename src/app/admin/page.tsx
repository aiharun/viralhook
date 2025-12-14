"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import {
    Users, Crown, Zap, TrendingUp, Loader2, Trash2,
    Search, RefreshCw, Shield, ShieldCheck, Home, Rocket,
    BarChart3, UserCheck, UserX, Activity, ChevronRight,
    Settings, X, User
} from "lucide-react";
import {
    getAllUsers,
    getDashboardStats,
    toggleUserPro,
    toggleAdminStatus,
    deleteUserAccount,
    resetUserGenerations,
    type UserStats,
    type DashboardStats
} from "@/lib/adminActions";

// Super admin email - only this user can assign admin roles
const SUPER_ADMIN_EMAIL = "widrivite@gmail.com";

const NICHE_TRANSLATIONS: Record<string, string> = {
    fitness: "Fitness",
    finance: "Finans",
    food: "Yemek",
    relationships: "İlişkiler",
    tech: "Teknoloji",
    travel: "Seyahat",
    fashion: "Moda",
    gaming: "Oyun",
    beauty: "Güzellik",
    education: "Eğitim",
    crypto: "Kripto",
    comedy: "Komedi",
    motivation: "Motivasyon",
    lifestyle: "Yaşam Tarzı",
    business: "İş & Kariyer",
    health: "Sağlık"
};

// Toggle Switch Component
function ToggleSwitch({
    enabled,
    onChange,
    disabled = false,
    colorClass = "bg-cyan-500"
}: {
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
    colorClass?: string;
}) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${enabled ? colorClass : 'bg-white/10'}`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}

// User Management Modal with Tabs
function UserModal({
    user,
    onClose,
    onTogglePro,
    onToggleAdmin,
    onResetGenerations,
    onDelete,
    loading,
    isSuperAdmin
}: {
    user: UserStats;
    onClose: () => void;
    onTogglePro: () => void;
    onToggleAdmin: () => void;
    onResetGenerations: () => void;
    onDelete: () => void;
    loading: boolean;
    isSuperAdmin: boolean;
}) {
    const [activeTab, setActiveTab] = useState<'manage' | 'history'>('manage');
    const [generations, setGenerations] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [expandedGen, setExpandedGen] = useState<string | null>(null);

    // Load generations when history tab is opened
    useEffect(() => {
        if (activeTab === 'history' && generations.length === 0) {
            loadGenerations();
        }
    }, [activeTab]);

    const loadGenerations = async () => {
        try {
            setLoadingHistory(true);
            const { getUserGenerations } = await import('@/lib/scriptService');
            const data = await getUserGenerations(user.id, 50);
            setGenerations(data);
        } catch (error) {
            console.error("Error loading generations:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass rounded-3xl p-6 w-full max-w-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                >
                    <X className="w-4 h-4 text-white/60" />
                </button>

                {/* User Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {(user.username || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {user.username && (
                                <h2 className="text-lg font-bold text-white">@{user.username}</h2>
                            )}
                            {user.isOnline && (
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                        </div>
                        <p className="text-white/60 text-sm">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                            {user.isPro && (
                                <Badge className="bg-purple-500/20 text-purple-300 text-xs">Pro</Badge>
                            )}
                            {user.isAdmin && (
                                <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">Admin</Badge>
                            )}
                        </div>
                    </div>
                    <div className="text-right mr-8">
                        <div className="text-lg font-bold text-white">{user.generationsTotal}</div>
                        <div className="text-xs text-white/50">Toplam Hook</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-4">
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'manage'
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Yönetim
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'history'
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        Geçmiş ({user.generationsTotal})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'manage' ? (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="glass rounded-xl p-3 text-center border border-white/10">
                                    <div className="text-xl font-bold text-white">{user.generationsToday}</div>
                                    <div className="text-xs text-white/50">Bugün</div>
                                </div>
                                <div className="glass rounded-xl p-3 text-center border border-white/10">
                                    <div className="text-xl font-bold text-white">{user.generationsTotal}</div>
                                    <div className="text-xs text-white/50">Toplam</div>
                                </div>
                                <div className="glass rounded-xl p-3 text-center border border-white/10">
                                    <div className="text-sm font-bold text-white">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</div>
                                    <div className="text-xs text-white/50">Kayıt</div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Yetkiler</h3>

                                {/* Pro Toggle */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <Crown className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white text-sm">Pro Üyelik</div>
                                            <div className="text-xs text-white/50">Sınırsız kredi</div>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        enabled={user.isPro}
                                        onChange={onTogglePro}
                                        disabled={loading}
                                        colorClass="bg-purple-500"
                                    />
                                </div>

                                {/* Admin Toggle */}
                                {isSuperAdmin && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm">Admin Yetkisi</div>
                                                <div className="text-xs text-white/50">Panel erişimi</div>
                                            </div>
                                        </div>
                                        <ToggleSwitch
                                            enabled={user.isAdmin}
                                            onChange={onToggleAdmin}
                                            disabled={loading}
                                            colorClass="bg-cyan-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2">
                                <Button
                                    onClick={onResetGenerations}
                                    disabled={loading}
                                    size="sm"
                                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    Günlük Kredileri Sıfırla
                                </Button>

                                <Button
                                    onClick={onDelete}
                                    disabled={loading}
                                    size="sm"
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Kullanıcıyı Sil
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                                </div>
                            ) : generations.length === 0 ? (
                                <div className="text-center py-12 text-white/40">
                                    <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Henüz hook üretimi yok</p>
                                </div>
                            ) : (
                                generations.map((gen) => (
                                    <div
                                        key={gen.id}
                                        className="glass rounded-xl border border-white/10 overflow-hidden"
                                    >
                                        {/* Generation Header */}
                                        <div
                                            className="p-3 cursor-pointer hover:bg-white/5 transition-all"
                                            onClick={() => setExpandedGen(expandedGen === gen.id ? null : gen.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                                        <Zap className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white text-sm">{gen.topic?.slice(0, 40) || 'Untitled'}...</div>
                                                        <div className="text-xs text-white/50 flex items-center gap-2">
                                                            <span>{NICHE_TRANSLATIONS[gen.niche] || gen.niche}</span>
                                                            <span>•</span>
                                                            <span>{gen.videoStyle}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-white/40">
                                                        {gen.createdAt?.toDate ?
                                                            new Date(gen.createdAt.toDate()).toLocaleDateString("tr-TR") :
                                                            new Date(gen.createdAt).toLocaleDateString("tr-TR")
                                                        }
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${expandedGen === gen.id ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedGen === gen.id && gen.scripts && (
                                            <div className="border-t border-white/10 p-3 space-y-3 bg-black/20">
                                                {gen.scripts.map((script: any, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                        <div className="text-xs text-cyan-400 font-semibold mb-1">Hook #{idx + 1}</div>
                                                        <p className="text-sm text-white/90 mb-2">{script.hook}</p>
                                                        <div className="text-xs text-white/50 line-clamp-2">{script.body?.slice(0, 150)}...</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();

    const [users, setUsers] = useState<UserStats[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPlan, setFilterPlan] = useState<"all" | "pro" | "free" | "admin">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
    const [showActiveModal, setShowActiveModal] = useState(false);

    // Protect route
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/");
            return;
        }
        if (!isAdmin) {
            router.push("/generator");
        }
    }, [user, isAdmin, authLoading, router]);

    // Real-time data subscription
    useEffect(() => {
        if (!isAdmin || !user) return;

        setLoading(true);

        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const SUPER_ADMIN_EMAIL_CHECK = "widrivite@gmail.com";
            const usersData: UserStats[] = [];

            snapshot.forEach((doc: any) => {
                const data = doc.data();
                // Skip super admin from list
                if (data.email === SUPER_ADMIN_EMAIL_CHECK) {
                    return;
                }
                usersData.push({
                    id: doc.id,
                    email: data.email || null,
                    username: data.username || data.displayUsername || null,
                    isPro: data.isPro || false,
                    isAdmin: data.isAdmin || false,
                    isOnline: data.isOnline || false,
                    generationsToday: data.generationsToday || 0,
                    generationsTotal: data.generationsTotal || 0,
                    createdAt: data.createdAt || "",
                    lastActivity: data.lastActivity || data.createdAt || "",
                });
            });

            setUsers(usersData);

            // Calculate stats from users
            const proUsers = usersData.filter(u => u.isPro).length;
            setStats({
                totalUsers: usersData.length,
                proUsers,
                freeUsers: usersData.length - proUsers,
                totalGenerationsToday: usersData.reduce((sum, u) => sum + u.generationsToday, 0),
                totalGenerationsAllTime: usersData.reduce((sum, u) => sum + u.generationsTotal, 0),
            });

            // Update selected user if modal is open
            if (selectedUser) {
                const updated = usersData.find(u => u.id === selectedUser.id);
                if (updated) setSelectedUser(updated);
            }

            setLoading(false);
        }, (error: any) => {
            console.error("Error in real-time subscription:", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isAdmin, user]);

    const loadData = async () => {
        // Manual refresh - triggers re-render which updates from snapshot
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    const handleTogglePro = async (userId: string) => {
        try {
            setActionLoading(userId);
            await toggleUserPro(userId);
            await loadData();
        } catch (error) {
            alert("Pro durumu değiştirilemedi");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
            return;
        }
        try {
            setActionLoading(userId);
            await deleteUserAccount(userId, user?.email || "");
            await loadData();
            setSelectedUser(null);
        } catch (error) {
            alert("Kullanıcı silinemedi");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleAdmin = async (userId: string) => {
        try {
            setActionLoading(userId);
            await toggleAdminStatus(userId, user?.email || "");
            await loadData();
        } catch (error: any) {
            alert(error.message || "Admin durumu değiştirilemedi");
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetGenerations = async (userId: string) => {
        try {
            setActionLoading(userId);
            await resetUserGenerations(userId);
            await loadData();
        } catch (error) {
            alert("Sıfırlanamadı");
        } finally {
            setActionLoading(null);
        }
    };

    const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchesSearch = !searchQuery ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPlan = filterPlan === "all" ||
            (filterPlan === "pro" && u.isPro) ||
            (filterPlan === "free" && !u.isPro && !u.isAdmin) ||
            (filterPlan === "admin" && u.isAdmin);

        return matchesSearch && matchesPlan;
    });

    // Calculate real total from users
    const totalGenerations = users.reduce((sum, u) => sum + (u.generationsTotal || 0), 0);

    // Loading state
    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white">
            {/* User Management Modal */}
            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onTogglePro={() => handleTogglePro(selectedUser.id)}
                    onToggleAdmin={() => handleToggleAdmin(selectedUser.id)}
                    onResetGenerations={() => handleResetGenerations(selectedUser.id)}
                    onDelete={() => handleDeleteUser(selectedUser.id, selectedUser.email || selectedUser.id)}
                    loading={actionLoading === selectedUser.id}
                    isSuperAdmin={isSuperAdmin}
                />
            )}

            {/* Active Users Modal - CEO Only */}
            {showActiveModal && isSuperAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowActiveModal(false)}
                    />
                    <div className="relative glass rounded-3xl p-6 w-full max-w-lg border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-hidden flex flex-col">
                        <button
                            onClick={() => setShowActiveModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-white/60" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Aktif Kullanıcılar</h2>
                                <p className="text-sm text-white/50">Çevrimiçi kullanıcılar</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            {users.filter(u => u.isOnline).length === 0 ? (
                                <div className="text-center py-8 text-white/40">
                                    <UserX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Şu an aktif kullanıcı yok</p>
                                </div>
                            ) : (
                                users.filter(u => u.isOnline).map(u => (
                                    <div
                                        key={u.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                {(u.username || u.email || "?")[0].toUpperCase()}
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {u.username && (
                                                <div className="font-medium text-white">@{u.username}</div>
                                            )}
                                            <div className="text-sm text-white/50 truncate">{u.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-green-400">Çevrimiçi</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all group-hover:scale-105">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                HookAI
                            </span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin Panel
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="ghost"
                            size="sm"
                            disabled={loading}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Link href="/generator">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                                <Zap className="w-4 h-4 mr-2" />
                                Generator
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                                <Home className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className={`grid grid-cols-2 ${isSuperAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-8`}>
                    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</span>
                        </div>
                        <p className="text-sm text-white/50">Toplam Kullanıcı</p>
                    </div>

                    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Crown className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats?.proUsers || 0}</span>
                        </div>
                        <p className="text-sm text-white/50">Pro Üyeler</p>
                    </div>

                    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-green-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Activity className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats?.totalGenerationsToday || 0}</span>
                        </div>
                        <p className="text-sm text-white/50">Bugünkü Üretim</p>
                    </div>

                    <div className="glass rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-2xl font-bold text-white">{totalGenerations}</span>
                        </div>
                        <p className="text-sm text-white/50">Toplam Üretim</p>
                    </div>

                    {/* Active Visitors - CEO Only */}
                    {isSuperAdmin && (
                        <div
                            className="glass rounded-2xl p-5 border border-white/10 hover:border-pink-500/30 transition-all group relative overflow-hidden cursor-pointer"
                            onClick={() => setShowActiveModal(true)}
                        >
                            <div className="absolute top-3 right-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    {users.filter(u => u.isOnline).length}
                                </span>
                            </div>
                            <p className="text-sm text-white/50">Aktif Ziyaretçi</p>
                            <p className="text-xs text-white/30 mt-1">Çevrimiçi kullanıcılar</p>
                        </div>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className="glass rounded-2xl p-4 border border-white/10 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Kullanıcı ara (email veya kullanıcı adı)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                            {[
                                { key: "all", label: "Tümü", icon: Users },
                                { key: "pro", label: "Pro", icon: Crown },
                                { key: "admin", label: "Admin", icon: Shield },
                                { key: "free", label: "Free", icon: UserCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterPlan(tab.key as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${filterPlan === tab.key
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="glass rounded-2xl p-12 border border-white/10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="glass rounded-2xl p-12 border border-white/10 text-center">
                            <UserX className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50">Kullanıcı bulunamadı</p>
                        </div>
                    ) : (
                        filteredUsers.map((u) => (
                            <div
                                key={u.id}
                                className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                                onClick={() => setSelectedUser(u)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                                            {(u.username || u.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {u.username && (
                                                    <span className="font-semibold text-white">@{u.username}</span>
                                                )}
                                                <span className="text-sm text-white/50 truncate">{u.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {u.isPro && (
                                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                                        <Crown className="w-3 h-3 mr-1" /> Pro
                                                    </Badge>
                                                )}
                                                {u.isAdmin && (
                                                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                                                        <Shield className="w-3 h-3 mr-1" /> Admin
                                                    </Badge>
                                                )}
                                                {!u.isPro && !u.isAdmin && (
                                                    <Badge variant="outline" className="text-white/50 border-white/20 text-xs">
                                                        Free
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-white">{u.generationsToday}</div>
                                            <div className="text-xs text-white/40">Bugün</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-white">{u.generationsTotal}</div>
                                            <div className="text-xs text-white/40">Toplam</div>
                                        </div>
                                        <div className="text-center hidden sm:block">
                                            <div className="text-sm text-white/60">{new Date(u.createdAt).toLocaleDateString("tr-TR")}</div>
                                            <div className="text-xs text-white/40">Kayıt</div>
                                        </div>
                                    </div>

                                    {/* Manage Button */}
                                    <Button
                                        size="sm"
                                        className="bg-white/10 hover:bg-white/20 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUser(u);
                                        }}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Yönet
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* User Count */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="mt-6 text-center text-sm text-white/40">
                        {filteredUsers.length} kullanıcı gösteriliyor
                    </div>
                )}
            </main>
        </div>
    );
}
