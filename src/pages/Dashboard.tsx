import { useEffect, useState } from "react";
import { User, Calendar, MapPin, Stethoscope, Activity, Shield, Loader2 } from "lucide-react";
import EligibilityBadge from "@/components/EligibilityBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { getEligibilityStatus, daysSinceLastDonation } from "@/lib/eligibility";
import type { Donor, Disease } from "@/lib/donors";
import { toast } from "sonner";
import type { PatientNeed } from "@/lib/alerts";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setDonor(data as Donor);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const toggleAvailability = async () => {
    if (!donor) return;
    const newAvailable = !donor.available;

    // Update local state optimistically
    setDonor({ ...donor, available: newAvailable });

    // Update DB
    const { error } = await supabase
      .from("donors")
      .update({ available: newAvailable })
      .eq("id", donor.id);

    if (error) {
      toast.error("Failed to update availability");
      setDonor({ ...donor, available: !newAvailable }); // Revert
    } else {
      toast.success(`Status updated to ${newAvailable ? "Available" : "Busy"}`);
    }
  };

  useEffect(() => {
    const onMessage = (payload: any) => {
      try {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (data?.type === "ALERT" && donor) {
          const need = data.need as PatientNeed;
          if (need && donor.available && donor.blood_group === need.blood_group) {
            toast.info(`Urgent request for ${need.blood_group}${need.city ? ` in ${need.city}` : ""}`);
          }
        }
      } catch { }
    };
    let ch: any = null;
    // @ts-ignore
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      // @ts-ignore
      ch = new BroadcastChannel("donor-alerts");
      ch.onmessage = (e: any) => onMessage(e.data);
    }
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "donor-alerts" && e.newValue) onMessage(e.newValue);
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      if (ch) ch.close();
      window.removeEventListener("storage", storageHandler);
    };
  }, [donor?.available, donor?.blood_group]);


  if (loading) {
    return <div className="container py-8 flex justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  }

  if (!donor) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome!</h1>
        <p className="text-muted-foreground mb-4">You have not completed your donor profile yet.</p>
        <a href="/register-donor" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-block font-medium">Complete Profile</a>
      </div>
    );
  }

  const eligibility = getEligibilityStatus(donor as any);
  const days = daysSinceLastDonation(donor.last_donation);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold animate-fade-in">Donor Dashboard</h1>
      <p className="mt-1 text-muted-foreground animate-fade-in stagger-1">Manage your donor profile, medical info, and availability</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{donor.name}</h2>
              <p className="text-sm text-muted-foreground">{donor.phone}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Blood Group</span>
              <span className="font-bold text-primary text-lg">{donor.blood_group}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Age / Gender</span>
              <span className="text-sm font-medium">{donor.age} yrs / {donor.gender}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Weight</span>
              <span className="text-sm font-medium">{donor.weight} kg</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Location
              </span>
              <span className="text-sm font-medium">{donor.area}, {donor.city}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in-up stagger-2">
          <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Status</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Eligibility</span>
              <EligibilityBadge status={eligibility} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Availability</span>
              <AvailabilityBadge available={donor.available} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Last Donation
              </span>
              <span className="text-sm font-medium">
                {donor.last_donation || "Never"} {days !== null && `(${days}d ago)`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Reliability
              </span>
              <span className="text-sm font-bold">{donor.reliability_score ?? 10}/10</span>
            </div>
            <button
              onClick={toggleAvailability}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] ${donor.available
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-success text-success-foreground hover:bg-success/90"
                }`}
            >
              {donor.available ? "Set as Busy" : "Set as Available"}
            </button>
          </div>
        </div>

        {/* Medical Summary Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2 animate-fade-in-up stagger-3">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Stethoscope className="h-4 w-4 text-primary" /> Medical Summary</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Health Condition</p>
              <span className={`text-sm font-bold ${donor.health_condition === "Healthy" ? "text-success" : "text-destructive"}`}>
                {donor.health_condition}
              </span>
            </div>
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Diseases</p>
              <div className="flex flex-wrap justify-center gap-1">
                {donor.diseases?.map((d) => (
                  <span key={d} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d === "None" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Eligibility</p>
              <EligibilityBadge status={eligibility} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
