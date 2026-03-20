import { useEffect, useState } from "react";
import { Loader2, Droplets, AlertCircle, Activity, Building2 } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import NgoSidebar from "@/components/ngo/NgoSidebar";

// Mock data type, replace completely in Inventory step
type NgoProfile = {
    id: string;
    ngo_name: string;
    city: string;
    address: string;
};

const NgoDashboard = () => {
    const { user } = useAuth();
    const [ngo, setNgo] = useState<NgoProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock stats - will connect to DB in analytics phase
    const stats = {
        totalUnits: 124,
        pendingRequests: 3,
        criticalLow: 2,
    };

    useEffect(() => {
        const fetchNgoProfile = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from("ngos")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (!error && data) {
                setNgo(data as NgoProfile);
            }
            setLoading(false);
        };

        fetchNgoProfile();
    }, [user]);

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!ngo) {
        return (
            <div className="container py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">NGO Profile Not Found</h1>
                <p className="text-muted-foreground max-w-md">We couldn't find an NGO profile associated with this account. Are you a regular donor?</p>
            </div>
        );
    }

    return (
        <div className="flex bg-muted/20 min-h-[calc(100vh-5rem)]">
            <NgoSidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="animate-fade-in-up">
                    <div className="flex flex-col gap-2 mb-8 border-b pb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-primary/80" /> {ngo.ngo_name}
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                            {ngo.address}, {ngo.city}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Quick Stat Cards */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4 animate-fade-in-up stagger-1 border-l-4 border-l-primary">
                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                <Droplets className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Blood Units</p>
                                <h3 className="text-3xl font-bold">{stats.totalUnits}</h3>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4 animate-fade-in-up stagger-2 border-l-4 border-l-warning">
                            <div className="rounded-full bg-warning/10 p-3 text-warning">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                                <h3 className="text-3xl font-bold">{stats.pendingRequests}</h3>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4 animate-fade-in-up stagger-3 border-l-4 border-l-destructive">
                            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Critical Shortages</p>
                                <h3 className="text-3xl font-bold">{stats.criticalLow}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl border bg-card p-8 shadow-sm text-center">
                        <h3 className="text-lg font-bold mb-2">Welcome to your operational dashboard</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Use the sidebar to navigate to your Blood Inventory to manage stock, Emergency Requests to approve outgoing blood bags to hospitals, or Analytics to view trends.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NgoDashboard;
