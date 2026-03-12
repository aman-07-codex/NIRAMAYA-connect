import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import NgoSidebar from "@/components/ngo/NgoSidebar";
import EmergencyCard, { EmergencyRequest } from "@/components/ngo/EmergencyCard";

const NgoRequests = () => {
    const { user } = useAuth();
    const [ngoId, setNgoId] = useState<string | null>(null);
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNgoId = async () => {
            if (!user) return;
            const { data } = await supabase
                .from("ngos")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (data) {
                setNgoId(data.id);
                fetchRequests(data.id);
            } else {
                setLoading(false);
            }
        };
        fetchNgoId();
    }, [user]);

    const fetchRequests = async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("emergency_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setRequests(data as EmergencyRequest[]);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!ngoId) {
        return (
            <div className="container py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">NGO Profile not found.</p>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pastRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="flex bg-muted/20 min-h-[calc(100vh-5rem)]">
            <NgoSidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="animate-fade-in-up">
                    <div className="flex flex-col gap-2 mb-8 border-b pb-4">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <AlertCircle className="h-7 w-7 text-primary" /> Emergency Requests
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Review and approve incoming emergency blood requests. Approving a request automatically deducts 1 unit from your inventory.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Action Required
                                <span className="bg-destructive text-destructive-foreground text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    {pendingRequests.length}
                                </span>
                            </h2>
                            {pendingRequests.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center bg-card">
                                    <p className="text-muted-foreground">No pending emergency requests.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pendingRequests.map(req => (
                                        <EmergencyCard
                                            key={req.id}
                                            request={req}
                                            ngoId={ngoId}
                                            onUpdate={() => fetchRequests(ngoId)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4 text-muted-foreground">Recent History</h2>
                            {pastRequests.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No historical requests found.</p>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-80">
                                    {pastRequests.map(req => (
                                        <EmergencyCard
                                            key={req.id}
                                            request={req}
                                            ngoId={ngoId}
                                            onUpdate={() => fetchRequests(ngoId)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NgoRequests;
