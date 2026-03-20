import { Activity, Users, Droplet, CheckCircle, BedDouble, ArchiveRestore } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    icuAvailable: 0,
    kitsAvailable: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("blood_requests")
          .select("status");
        
        // In a real scenario, you'd filter by requests visible to this hospital
        // e.g. .or(`hospital_id.eq.${user.id},hospital_id.is.null`)

        if (error) throw error;

        if (data) {
          const counts = data.reduce(
            (acc, curr) => {
              acc.total++;
              if (curr.status === "Pending") acc.pending++;
              if (curr.status === "Accepted") acc.accepted++;
              if (curr.status === "Completed") acc.completed++;
              return acc;
            },
            { total: 0, pending: 0, accepted: 0, completed: 0 }
          );
          // Fetch resources for quick glimpse
          const { data: resData } = await supabase
            .from("hospital_resources")
            .select("resource_type, available_units")
            .eq("hospital_id", user.id)
            .in("resource_type", ["ICU_BEDS", "MEDICAL_KITS"]);
            
          let icu = 0;
          let kits = 0;
          if (resData) {
            resData.forEach(r => {
              if (r.resource_type === "ICU_BEDS") icu = r.available_units;
              if (r.resource_type === "MEDICAL_KITS") kits = r.available_units;
            });
          }

          setStats({ ...counts, icuAvailable: icu, kitsAvailable: kits });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 border-b pb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Monitor your blood request statistics and activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Requests */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Requests</h3>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All incoming requests</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Requests</h3>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting hospital acceptance</p>
          </div>
        </div>

        {/* Accepted Requests */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Accepted Requests</h3>
            <Droplet className="h-4 w-4 text-blue-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently assigned to you</p>
          </div>
        </div>

        {/* Completed Requests */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Completed Deliveries</h3>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully fulfilled</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-emerald-900 border-b pb-2 mb-4">
          Key Resources
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* ICU Beds */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">ICU Beds Available</h3>
              <BedDouble className={`h-4 w-4 ${stats.icuAvailable < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-600'}`} />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stats.icuAvailable}</div>
              {stats.icuAvailable < 5 && (
                <span className="inline-flex mt-1 items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                  Critical Low
                </span>
              )}
            </div>
          </div>

          {/* Medical Kits */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Medical Kits</h3>
              <ArchiveRestore className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stats.kitsAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for emergencies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
