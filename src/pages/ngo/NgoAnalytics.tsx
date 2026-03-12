import { useEffect, useState } from "react";
import { Loader2, BarChart3, Activity, Droplet, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import NgoSidebar from "@/components/ngo/NgoSidebar";
import { BLOOD_GROUPS } from "@/lib/donors";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const NgoAnalytics = () => {
    const { user } = useAuth();
    const [ngoId, setNgoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [inventoryStats, setInventoryStats] = useState(
        BLOOD_GROUPS.map(bg => ({ name: bg, units: 0 }))
    );
    const [totals, setTotals] = useState({ inventory: 0, requests: 0, issued: 0 });

    useEffect(() => {
        const fetchNgoId = async () => {
            if (!user) return;
            const { data } = await supabase.from("ngos").select("id").eq("user_id", user.id).single();
            if (data) {
                setNgoId(data.id);
                fetchAnalytics(data.id);
            } else {
                setLoading(false);
            }
        };
        fetchNgoId();
    }, [user]);

    const fetchAnalytics = async (id: string) => {
        setLoading(true);

        // Fetch Inventory Distribution
        const { data: invData } = await supabase.from("inventory").select("blood_group, units").eq("ngo_id", id);

        // Fetch Request Volume
        // Note: Since requests are global in our simple schema, we just count all. 
        // In a real app, requests might be routed to specific NGOs.
        const { count: reqCount } = await supabase.from("emergency_requests").select("*", { count: 'exact', head: true });

        // Fetch Issue History
        const { data: issueData } = await supabase.from("blood_issue_history").select("units_issued").eq("ngo_id", id);

        if (invData) {
            const statsMap = new Map(BLOOD_GROUPS.map(bg => [bg, 0]));
            let totalInv = 0;

            invData.forEach(item => {
                const current = statsMap.get(item.blood_group) || 0;
                statsMap.set(item.blood_group, current + item.units);
                totalInv += item.units;
            });

            setInventoryStats(Array.from(statsMap, ([name, units]) => ({ name, units })));

            const totalIssued = issueData ? issueData.reduce((acc, curr) => acc + curr.units_issued, 0) : 0;

            setTotals({
                inventory: totalInv,
                requests: reqCount || 0,
                issued: totalIssued
            });
        }

        setLoading(false);
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!ngoId) {
        return (
            <div className="container py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">NGO Profile not found.</p>
            </div>
        );
    }

    // Calculate Critical Lows
    const criticalLows = inventoryStats.filter(s => s.units < 5);

    return (
        <div className="flex bg-muted/20 min-h-[calc(100vh-5rem)]">
            <NgoSidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="animate-fade-in-up">
                    <div className="flex flex-col gap-2 mb-8 border-b pb-4">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <BarChart3 className="h-7 w-7 text-primary" /> Analytics Overview
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Visualize your operational performance and track blood distributions.
                        </p>
                    </div>

                    {/* Key Performance Indicators */}
                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center animate-fade-in-up stagger-1">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                <Droplet className="h-4 w-4" /> Total Units in Stock
                            </div>
                            <div className="text-4xl font-bold">{totals.inventory}</div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center animate-fade-in-up stagger-2">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                <TrendingUp className="h-4 w-4" /> Units Issued (All Time)
                            </div>
                            <div className="text-4xl font-bold text-success">{totals.issued}</div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center animate-fade-in-up stagger-3">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                <Activity className="h-4 w-4" /> Platform Emergency Requests
                            </div>
                            <div className="text-4xl font-bold text-primary">{totals.requests}</div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Chart */}
                        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm animate-fade-in-up stagger-4 flex flex-col h-[400px]">
                            <h3 className="font-bold mb-6">Inventory Distribution by Blood Group</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={inventoryStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: 'hsl(var(--foreground))' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        />
                                        <Bar
                                            dataKey="units"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Low Stock Watchlist */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-in-up stagger-5 flex flex-col">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" /> Low Stock Watchlist
                            </h3>

                            {criticalLows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                                        <Droplet className="h-6 w-6 text-success" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">All blood groups are well stocked.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {criticalLows.map(group => (
                                        <div key={group.name} className="flex justify-between items-center p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                            <span className="font-bold text-destructive text-lg">{group.name}</span>
                                            <div className="text-right">
                                                <span className="font-bold">{group.units}</span>
                                                <span className="text-xs text-muted-foreground block">Units Left</span>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        * Showing groups with fewer than 5 units available.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NgoAnalytics;
