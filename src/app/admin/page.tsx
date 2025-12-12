"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, Crown, Zap, TrendingUp, Loader2, Trash2,
    ToggleLeft, ToggleRight, ChevronLeft, Search, RefreshCw
} from "lucide-react";
import {
    getAllUsers,
    getDashboardStats,
    toggleUserPro,
    deleteUserAccount,
    resetUserGenerations,
    type UserStats,
    type DashboardStats
} from "@/lib/adminActions";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();

    const [users, setUsers] = useState<UserStats[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPlan, setFilterPlan] = useState<"all" | "pro" | "free">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Protect route - wait for auth to load
    useEffect(() => {
        if (authLoading) return; // Wait for auth to load

        if (!user) {
            router.push("/");
            return;
        }

        if (!isAdmin) {
            console.log("Not admin, redirecting...");
            router.push("/generator");
        }
    }, [user, isAdmin, authLoading, router]);

    // Load data
    useEffect(() => {
        if (isAdmin && user) {
            loadData();
        }
    }, [isAdmin, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData] = await Promise.all([
                getAllUsers(),
                getDashboardStats(),
            ]);
            setUsers(usersData);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePro = async (userId: string) => {
        try {
            setActionLoading(userId);
            await toggleUserPro(userId);
            await loadData(); // Refresh
        } catch (error) {
            alert("Pro durumu değiştirilemedi");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            await deleteUserAccount(userId);
            await loadData(); // Refresh
        } catch (error) {
            alert("Kullanıcı silinemedi");
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

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchesSearch = !searchQuery ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPlan = filterPlan === "all" ||
            (filterPlan === "pro" && u.isPro) ||
            (filterPlan === "free" && !u.isPro);

        return matchesSearch && matchesPlan;
    });

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/generator">
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Geri
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Kullanıcı ve sistem yönetimi</p>
                            </div>
                        </div>
                        <Button onClick={loadData} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Yenile
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="glass border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Toplam Kullanıcı
                            </CardTitle>
                            <Users className="w-4 h-4 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pro Kullanıcılar
                            </CardTitle>
                            <Crown className="w-4 h-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.proUsers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats && stats.totalUsers > 0
                                    ? `${Math.round((stats.proUsers / stats.totalUsers) * 100)}%`
                                    : "0%"
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Bugünkü Hook'lar
                            </CardTitle>
                            <Zap className="w-4 h-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalGenerationsToday || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Toplam Hook
                            </CardTitle>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalGenerationsAllTime || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Management */}
                <Card className="glass border-white/10">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <CardTitle className="text-white">Kullanıcı Yönetimi</CardTitle>
                            <div className="flex gap-2">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                                {/* Filter */}
                                <select
                                    value={filterPlan}
                                    onChange={(e) => setFilterPlan(e.target.value as any)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                >
                                    <option value="all">Tümü</option>
                                    <option value="pro">Pro</option>
                                    <option value="free">Free</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Email</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Plan</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Bugün</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Toplam</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Kayıt</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4 text-sm text-white">{u.email || u.id.slice(0, 8)}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={u.isPro ? "default" : "outline"} className={u.isPro ? "bg-purple-500/20 text-purple-300" : ""}>
                                                    {u.isPro ? "Pro" : "Free"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{u.generationsToday}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{u.generationsTotal}</td>
                                            <td className="py-3 px-4 text-xs text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleTogglePro(u.id)}
                                                        disabled={actionLoading === u.id}
                                                        className="text-xs"
                                                    >
                                                        {actionLoading === u.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : u.isPro ? (
                                                            <ToggleRight className="w-4 h-4 text-purple-400" />
                                                        ) : (
                                                            <ToggleLeft className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteUser(u.id, u.email || u.id)}
                                                        disabled={actionLoading === u.id}
                                                        className="text-xs text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    Kullanıcı bulunamadı
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
