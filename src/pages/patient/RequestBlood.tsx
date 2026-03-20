import { useState, useEffect } from "react";
import {
  Droplets,
  AlertTriangle,
  MapPin,
  Send,
  Loader2,
  Syringe,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_LEVELS = [
  { id: "Low", label: "Low", desc: "Routine requirement", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-500" },
  { id: "Medium", label: "Medium", desc: "Needed soon", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", ring: "ring-amber-500" },
  { id: "High", label: "High", desc: "Emergency / Critical", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", ring: "ring-rose-500" },
] as const;

type UrgencyType = typeof URGENCY_LEVELS[number]["id"];

const RequestBlood = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState<number | "">("");
  const [urgency, setUrgency] = useState<UrgencyType>("Low");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  const [hospitals, setHospitals] = useState<any[]>([]);
  const [fetchingHospitals, setFetchingHospitals] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from("hospitals")
          .select("id, hospital_name, city, hospital_type")
          .order("hospital_name");
        
        if (data) setHospitals(data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      } finally {
        setFetchingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to request blood.");
      return;
    }

    if (!bloodGroup || !units || !selectedHospitalId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Supabase strict constraint checks 'Normal' or 'High'
    const dbUrgency = urgency === "High" ? "High" : "Normal";

    // Grab hospital details to populate the mandatory 'location' text field
    const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);
    const locationText = selectedHospital ? `${selectedHospital.hospital_name}, ${selectedHospital.city}` : "Unknown Location";

    setLoading(true);
    try {
      const { error } = await supabase.from("blood_requests").insert({
        patient_id: user.id,
        hospital_id: selectedHospitalId || null,
        blood_group: bloodGroup,
        units_required: Number(units),
        urgency: dbUrgency,
        location: locationText,
        status: "Pending",
      });

      if (error) throw error;

      toast.success("Blood request submitted successfully!");
      setSuccess(true);
      
      // Reset form
      setBloodGroup("");
      setUnits("");
      setUrgency("Low");
      setSelectedHospitalId("");
      
      // Auto-hide success state after a few seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-4 shadow-inner">
          <Droplets className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Request Blood
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Need blood? Fill out the details below and we will instantly notify compatible donors and nearby blood banks.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-emerald-900">Request Sent Successfully</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Your request is now live. We are searching for donors. You can track this in 'My Requests'.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-3xl border bg-card shadow-xl shadow-black/5 overflow-hidden animate-fade-in-up">
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Requirement Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Top Row: Blood Group & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Blood Group <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-background px-4 py-3.5 pr-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Select group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Units Required <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value) || "")}
                  placeholder="e.g. 2"
                  className="w-full rounded-xl border bg-background px-4 py-3.5 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Syringe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Location / Hospital */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Select Hospital / Blood Bank <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                disabled={fetchingHospitals}
                className="w-full appearance-none rounded-xl border bg-background px-4 py-3.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="" disabled>
                  {fetchingHospitals ? "Loading registered providers..." : "Select near you"}
                </option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hospital_name} ({h.hospital_type}) - {h.city}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                 <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-1">
              Your request will be directly visible to the selected facility.
            </p>
          </div>

          {/* Urgency Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Urgency Level <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {URGENCY_LEVELS.map((level) => {
                const isSelected = urgency === level.id;
                return (
                  <label
                    key={level.id}
                    className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-all duration-200 ${
                      isSelected
                        ? `${level.border} ${level.bg} ring-1 ${level.ring}`
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.id}
                      checked={isSelected}
                      onChange={() => setUrgency(level.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isSelected ? level.color : "text-foreground"}`}>
                        {level.label}
                      </span>
                      {isSelected && <Activity className={`h-4 w-4 ${level.color} animate-pulse`} />}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {level.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Broadcasting Request...
                </>
              ) : (
                <>
                  Submit Request
                  <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestBlood;
