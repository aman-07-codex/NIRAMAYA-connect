import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { format } from "date-fns";
import { toast } from "sonner";
import { MapPin, Clock, AlertTriangle, Check, CheckCircle2, ChevronRight } from "lucide-react";

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

const AcceptedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*, patients:patient_id(full_name)")
        .eq("status", "Accepted")
        .eq("hospital_id", user.id)
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
      toast.error("Failed to load accepted blood requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleMarkCompleted = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("blood_requests")
        .update({ status: "Completed" })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Request for ${name} marked as Completed`);
      // Update UI optimistically
      setRequests(curr => curr.filter(req => req.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            Accepted Requests
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage the blood requests your hospital has committed to fulfilling.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-3xl border-emerald-100 bg-emerald-50/50 shadow-inner">
          <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-5 rotate-12">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">All caught up!</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            You don't have any active accepted requests in your queue. Go to "Blood Requests" to assign new cases to your hospital.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`group bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 p-6 ${
                req.urgency === "High" ? "border-rose-200 bg-rose-50/30" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Left content: Icon and main info */}
                <div className="flex gap-5 items-start">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300 ${
                    req.urgency === "High" ? "bg-gradient-to-br from-rose-500 to-red-600 text-white" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}>
                    <span className="font-extrabold text-xl tracking-tight">{req.blood_group}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-xl text-foreground">
                        {req.patient_details?.full_name || "Patient"}
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 uppercase tracking-widest">
                        In Progress
                      </span>
                      {req.urgency === "High" && (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 uppercase tracking-widest">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          High Priority
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-foreground/80">
                      Requires {req.units_required} {req.units_required === 1 ? 'Unit' : 'Units'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {req.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 shrink-0" />
                        Accepted on {format(new Date(req.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right content: Actions */}
                <div className="flex items-center justify-start md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                  <button
                    onClick={() => handleMarkCompleted(req.id, req.patient_details?.full_name || "Patient")}
                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <Check className="h-5 w-5" />
                    Mark as Completed
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedRequests;
