import { useEffect, useState } from "react";
import { Loader2, Database } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import NgoSidebar from "@/components/ngo/NgoSidebar";
import InventoryTable from "@/components/ngo/InventoryTable";

const NgoInventory = () => {
    const { user } = useAuth();
    const [ngoId, setNgoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNgoId = async () => {
            if (!user) return;
            const { data } = await supabase
                .from("ngos")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (data) setNgoId(data.id);
            setLoading(false);
        };
        fetchNgoId();
    }, [user]);

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

    return (
        <div className="flex bg-muted/20 min-h-[calc(100vh-5rem)]">
            <NgoSidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="animate-fade-in-up">
                    <div className="flex flex-col gap-2 mb-6 border-b pb-4">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Database className="h-7 w-7 text-primary" /> Blood Inventory
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your blood stock levels. Rows highlighted in red are running critically low.
                        </p>
                    </div>

                    {/* Render our powerful Inventory Table Component */}
                    <InventoryTable ngoId={ngoId} />
                </div>
            </main>
        </div>
    );
};

export default NgoInventory;
