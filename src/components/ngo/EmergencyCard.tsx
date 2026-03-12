import { useState } from "react";
import { format } from "date-fns";
import { Loader2, MapPin, Phone, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type RequestStatus = "pending" | "approved" | "rejected";

export type EmergencyRequest = {
    id: string;
    blood_group: string;
    location: string;
    patient_phone: string;
    status: RequestStatus;
    created_at: string;
};

type EmergencyCardProps = {
    request: EmergencyRequest;
    ngoId: string;
    onUpdate: () => void;
};

const EmergencyCard = ({ request, ngoId, onUpdate }: EmergencyCardProps) => {
    const [loading, setLoading] = useState(false);

    const handleDecision = async (decision: "approved" | "rejected") => {
        if (!confirm(`Are you sure you want to mark this request as ${decision}?`)) return;
        setLoading(true);

        if (decision === "approved") {
            // 1. Check if we have enough inventory for this blood group
            const { data: inventoryData, error: inventoryError } = await supabase
                .from("inventory")
                .select("id, units")
                .eq("ngo_id", ngoId)
                .eq("blood_group", request.blood_group)
                .gte("units", 1) // Need at least 1 unit
                .order("expiry_date", { ascending: true }) // Use oldest first
                .limit(1);

            if (inventoryError || !inventoryData || inventoryData.length === 0) {
                toast.error(`Insufficient inventory for ${request.blood_group}`);
                setLoading(false);
                return;
            }

            const inventoryRecord = inventoryData[0];

            // 2. Deduct inventory
            const { error: deductError } = await supabase
                .from("inventory")
                .update({ units: inventoryRecord.units - 1, updated_at: new Date().toISOString() })
                .eq("id", inventoryRecord.id);

            if (deductError) {
                toast.error("Failed to deduct inventory");
                setLoading(false);
                return;
            }

            // 3. Log issue history
            await supabase.from("blood_issue_history").insert({
                ngo_id: ngoId,
                blood_group: request.blood_group,
                units_issued: 1
            });
        }

        // 4. Update request status
        const { error: statusError } = await supabase
            .from("emergency_requests")
            .update({ status: decision })
            .eq("id", request.id);

        if (statusError) {
            toast.error(statusError.message);
        } else {
            toast.success(`Request marked as ${decision}`);
            onUpdate();
        }

        setLoading(false);
    };

    const getStatusColor = (status: RequestStatus) => {
        switch (status) {
            case "approved": return "bg-success/10 text-success border-success/20";
            case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
            default: return "bg-warning/10 text-warning border-warning/20";
        }
    };

    return (
        <div className={`rounded-lg border bg-card p-5 shadow-sm transition-all relative overflow-hidden ${request.status === 'pending' ? 'hover:border-primary/50' : ''}`}>
            {request.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>}
            {request.status === 'approved' && <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive font-bold text-lg">
                        {request.blood_group}
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Emergency Request</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getStatusColor(request.status)}`}>
                    {request.status}
                </span>
            </div>

            <div className="space-y-2 mb-6">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" /> {request.location}
                </p>
                <p className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" /> {request.patient_phone}
                </p>
            </div>

            {request.status === "pending" && (
                <div className="flex gap-2">
                    <button
                        disabled={loading}
                        onClick={() => handleDecision("approved")}
                        className="flex-1 flex items-center justify-center gap-2 rounded-md bg-success/10 text-success hover:bg-success hover:text-success-foreground px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Approve & Allocate
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleDecision("rejected")}
                        className="flex items-center justify-center p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                        title="Reject Request"
                    >
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
            )}

            {request.status === "approved" && (
                <div className="text-sm text-success flex items-center gap-1.5 font-medium bg-success/5 p-2 rounded-md justify-center border border-success/10">
                    <CheckCircle className="h-4 w-4" /> 1 Unit Allocated from Inventory
                </div>
            )}
        </div>
    );
};

export default EmergencyCard;
