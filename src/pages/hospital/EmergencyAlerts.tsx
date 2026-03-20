import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Clock, Siren, Check } from "lucide-react";

type AlertRequest = {
  id: string;
  patient_id: string;
  blood_group: string;
  units_required: number;
  location: string;
  status: string;
  created_at: string;
  patient_details?: {
    full_name: string;
  };
};

const EmergencyAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*, patients:patient_id(full_name)")
        .eq("status", "Pending")
        .eq("urgency", "High")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedData = data?.map((req: any) => ({
        ...req,
        patient_details: req.patients ? Array.isArray(req.patients) ? req.patients[0] : req.patients : { full_name: "Unknown Patient" }
      })) as AlertRequest[];

      setAlerts(mappedData || []);
    } catch (error: any) {
      toast.error("Failed to load emergency alerts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const handleQuickAccept = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("blood_requests")
        .update({ status: "Accepted", hospital_id: user.id })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Emergency request accepted!");
      fetchAlerts(); 
    } catch (error: any) {
      toast.error(error.message || "Failed to accept request");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
        <div className="bg-rose-100 p-2 rounded-lg">
          <Siren className="h-6 w-6 text-rose-600 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-900">
            Emergency Alerts
          </h1>
          <p className="text-rose-600/80 mt-1 font-medium text-sm">
            High urgency blood requests requiring immediate attention.
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-xl border-emerald-100 bg-emerald-50/50">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-900">No active emergencies</h3>
          <p className="text-muted-foreground mt-1">All clear in your area.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-card rounded-xl border-2 border-rose-200 shadow-sm shadow-rose-100 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-red-600 animate-pulse" />
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {alert.blood_group}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {alert.patient_details?.full_name || "Patient Emergency"}
                      </h3>
                      <div className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        <AlertTriangle className="mr-1 h-3 w-3" /> CRITICAL
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-rose-600">{alert.units_required}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Units</div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Posted {format(new Date(alert.created_at), "h:mm a, MMM d")}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAccept(alert.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Siren className="h-4 w-4" />
                  Quick Accept Emergency
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;
