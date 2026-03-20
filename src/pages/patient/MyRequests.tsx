import { useState, useEffect } from "react";
import { ClipboardList, Inbox, Droplets, MapPin, Calendar, Activity, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

type RequestStatus = "Pending" | "Accepted" | "Completed" | "Rejected";
type FilterTab = "All" | "Pending" | "Completed";

interface BloodRequest {
  id: string;
  blood_group: string;
  units_required: number;
  urgency: "Normal" | "High";
  location: string;
  status: RequestStatus;
  created_at: string;
}

const MyRequests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("blood_requests")
          .select("*")
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setRequests(data as BloodRequest[]);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  // Derived state with filtering
  const filteredRequests = requests.filter((req) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return req.status === "Pending";
    if (activeTab === "Completed") return req.status === "Completed" || req.status === "Accepted";
    return true;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "Accepted":
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> {status}
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <Activity className="h-3 w-3" /> Rejected
          </span>
        );
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 shadow-sm">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Requests
        </h1>
        <p className="text-muted-foreground mt-2">
          Track the status of all your submitted blood requirements.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-3 animate-fade-in-up stagger-1 border-b pb-4 overflow-x-auto no-scrollbar">
        {(["All", "Pending", "Completed"] as FilterTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in-up stagger-2">
        {loading ? (
          // Skeleton Loader
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row gap-6 animate-pulse">
                <div className="h-16 w-16 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 w-1/3 rounded-md bg-muted" />
                  <div className="h-4 w-1/2 rounded-md bg-muted" />
                  <div className="h-4 w-1/4 rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-muted bg-muted/10">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-5 shadow-inner">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No requests found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {activeTab === "All" 
                ? "When you submit a blood request, it will appear here with real-time status updates."
                : `You don't have any ${activeTab.toLowerCase()} requests matching this filter.`}
            </p>
          </div>
        ) : (
          // Real Data Cards
          <div className="grid gap-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="group rounded-2xl border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 hover:border-primary/20">
                
                {/* Blood Group Icon */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-rose-50 border border-rose-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Droplets className="h-6 w-6 text-rose-500 mb-0.5" />
                  <span className="font-extrabold text-rose-700 text-sm tracking-tight">{req.blood_group}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-foreground text-lg truncate">
                      {req.units_required} {req.units_required === 1 ? 'Unit' : 'Units'} Required
                    </h3>
                    {getStatusBadge(req.status)}
                    {req.urgency === "High" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700 uppercase tracking-widest border border-rose-200">
                        High Urgency
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{req.location}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80 sm:flex-col sm:items-end sm:gap-1.5 pl-1 sm:pl-4 sm:border-l sm:ml-2">
                  <Calendar className="h-4 w-4 sm:hidden text-muted-foreground/70" />
                  <span className="shrink-0">{formatDate(req.created_at)}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
