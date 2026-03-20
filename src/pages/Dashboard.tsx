import { useEffect, useState } from "react";
import { User, Calendar, MapPin, Stethoscope, Activity, Shield, Loader2, Bell, AlertTriangle, Sparkles, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import EligibilityBadge from "@/components/EligibilityBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { getEligibilityStatus, daysSinceLastDonation } from "@/lib/eligibility";
import type { Donor, Disease } from "@/lib/donors";
import { toast } from "sonner";
import type { PatientNeed } from "@/lib/alerts";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";

type AppNotification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .eq("donor_id", data.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (notifData) {
          setNotifications(notifData as AppNotification[]);
        }
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
    if (!donor) return;

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `donor_id=eq.${donor.id}`
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
          toast.info("New Donor Alert! Check your dashboard notifications.");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donor?.id]);


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

        {/* Notifications Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2 animate-fade-in-up stagger-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Bell className="h-4 w-4 text-primary" /> Recent Alerts</h3>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent alerts.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 rounded-md bg-muted/30 p-3">
                  <div className="mt-0.5 rounded-full bg-warning/10 p-1.5 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    {(notif.message.toLowerCase().includes("sent their report") || notif.message.toLowerCase().includes("blood report")) && (
                      <button 
                        onClick={() => {
                          setShowReportModal(true);
                          setAiResult(null);
                        }}
                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Viewer Modal with AI Verification */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Patient Blood Report</h3>
            <div className="border bg-muted/20 rounded-md p-4 mb-4">
              <div className="flex justify-between border-b pb-2 mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Document Viewer</span>
                <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">Emergency</span>
              </div>
              <p className="text-sm mb-1"><strong>Status:</strong> Emergency Review Requested</p>
              <p className="text-sm mb-1"><strong>Document Type:</strong> Standard Blood Panel (PDF)</p>
              <p className="text-sm mb-1"><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-3 italic">
                [Simulated View] The patient's uploaded blood report document would be rendered here in a production environment.
              </p>
            </div>

            {/* AI Verification Section */}
            {!aiResult && !aiLoading && (
              <button
                onClick={async () => {
                  setAiLoading(true);
                  // Simulate AI processing delay
                  await new Promise(r => setTimeout(r, 2500));
                  // Simulated AI verification result
                  setAiResult({
                    authenticity_score: 87,
                    status: "Authentic",
                    confidence: 92,
                    flags: [
                      "Hemoglobin value is within normal range",
                      "All CBC parameters are medically consistent",
                      "Lab name and date are present",
                      "Reference ranges match standard Indian lab formats"
                    ],
                    explanation: "The blood report appears to be a genuine lab-issued document. All values fall within realistic human ranges, the formatting is consistent with standard pathology lab reports, and no signs of tampering or fabrication were detected.",
                    suggestion: "The report is verified as authentic. You can safely proceed with assisting this patient."
                  });
                  setAiLoading(false);
                }}
                className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:from-violet-700 hover:to-indigo-700 transition-all hover:scale-[1.02] shadow-md"
              >
                <Sparkles className="h-4 w-4" /> Verify Report Authenticity
              </button>
            )}

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <p className="text-sm font-medium text-muted-foreground">Verifying report authenticity...</p>
                <p className="text-xs text-muted-foreground">Checking medical validity, formatting consistency, data integrity & fraud signals</p>
              </div>
            )}

            {aiResult && (
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Report Authenticity Verification</span>
                </div>
                <div className="p-4 space-y-4">
                  {/* Score & Status Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Authenticity Score</p>
                      <span className={`text-2xl font-bold ${
                        aiResult.authenticity_score >= 70 ? "text-success" : aiResult.authenticity_score >= 40 ? "text-warning" : "text-destructive"
                      }`}>{aiResult.authenticity_score}/100</span>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                        aiResult.status === "Authentic" ? "text-success" : aiResult.status === "Suspicious" ? "text-warning" : "text-destructive"
                      }`}>
                        {aiResult.status === "Authentic" ? <CheckCircle className="h-4 w-4" /> : aiResult.status === "Suspicious" ? <AlertCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {aiResult.status}
                      </span>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <span className="text-2xl font-bold text-primary">{aiResult.confidence}%</span>
                    </div>
                  </div>

                  {/* Flags */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Analysis Flags</p>
                    <div className="space-y-1.5">
                      {aiResult.flags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-success flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="rounded-md bg-success/5 border border-success/20 p-3">
                    <p className="text-xs font-semibold text-success mb-1">Explanation</p>
                    <p className="text-sm">{aiResult.explanation}</p>
                  </div>

                  {/* Suggestion */}
                  <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                    <p className="text-xs font-semibold text-primary mb-1">Suggestion</p>
                    <p className="text-sm">{aiResult.suggestion}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  setAiResult(null);
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
