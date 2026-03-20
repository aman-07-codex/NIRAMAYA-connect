import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { format } from "date-fns";
import { toast } from "sonner";
import { Droplet, MapPin, Clock, AlertTriangle, Check, X } from "lucide-react";

type BloodRequest = {
  id: string;
  patient_id: string;
  blood_group: string;
  units_required: number;
  urgency: string;
  location: string;
  status: string;
  created_at: string;
  patient_details?: {
    full_name: string;
  };
};

const BloodRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*, patients:patient_id(full_name)")
        .in("status", ["Pending", "Accepted"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map the joined patients data to a standardized property
      const mappedData = data?.map((req: any) => ({
        ...req,
        patient_details: req.patients ? Array.isArray(req.patients) ? req.patients[0] : req.patients : { full_name: "Unknown Patient" }
      })) as BloodRequest[];

      setRequests(mappedData || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load blood requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      // Opt: if accepting, bind hospital_id to current user
      const payload: any = { status: newStatus };
      if (newStatus === "Accepted" && user) {
        payload.hospital_id = user.id;
      }

      const { error } = await supabase
        .from("blood_requests")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Request marked as ${newStatus}`);
      fetchRequests(); // Optimistic update could be slightly faster, but refetch is safer
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">
            Blood Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming patient blood requests.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl border-emerald-100 bg-emerald-50/50">
          <Droplet className="mx-auto h-12 w-12 text-emerald-300" />
          <h3 className="mt-4 text-lg font-semibold text-emerald-900">No active requests</h3>
          <p className="text-muted-foreground">You're all caught up for now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-card rounded-xl border shadow-sm p-5 transition-all outline outline-1 outline-transparent ${
                req.urgency === "High" ? "outline-rose-500/20 bg-rose-50/10 shadow-rose-100/50" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Left side details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-xl shrink-0 shadow-inner">
                      {req.blood_group}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {req.patient_details?.full_name || "Patient"}
                        {req.urgency === "High" && (
                          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Urgent
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          req.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                          req.status === "Accepted" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}>
                          {req.status}
                        </span>
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        Needs {req.units_required} Units
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4 shrink-0" />
                      {req.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 shrink-0" />
                      {format(new Date(req.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex flex-row sm:flex-col justify-end gap-2 pt-2 sm:pt-0 sm:min-w-[140px]">
                  {req.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(req.id, "Accepted")}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 transition"
                      >
                        <Check className="mr-1.5 h-4 w-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, "Rejected")}
                        className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-destructive transition"
                      >
                        <X className="mr-1.5 h-4 w-4" /> Reject
                      </button>
                    </>
                  )}
                  {req.status === "Accepted" && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, "Completed")}
                      className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BloodRequests;
