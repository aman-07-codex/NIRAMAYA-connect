import { useState } from "react";
import { toast } from "sonner";
import { BLOOD_GROUPS } from "@/lib/donors";
import { isEligible, daysSinceLastDonation } from "@/lib/eligibility";
import { getCurrentPosition } from "@/lib/geo";
import EligibilityBadge from "@/components/EligibilityBadge";
import { Loader2, MapPin } from "lucide-react";

const RegisterDonor = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    blood_group: "",
    city: "",
    area: "",
    last_donation: "",
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eligible = isEligible(form.last_donation || null);
  const days = daysSinceLastDonation(form.last_donation || null);

  const captureLocation = async () => {
    setLocLoading(true);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
      toast.success("Location captured successfully!");
    } catch {
      toast.error("Could not get your location. Please allow location access.");
    }
    setLocLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.blood_group || !form.city || !form.area) {
      toast.error("Please fill all required fields");
      return;
    }
    // In a real app this would insert into Supabase
    toast.success("Donor registration successful! Thank you for saving lives.");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-success/10 p-4">
          <svg className="h-12 w-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold">Registration Complete!</h2>
        <p className="mt-2 text-muted-foreground">You are now registered as a blood donor.</p>
        <EligibilityBadge eligible={eligible} className="mt-3 text-sm" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Register as a Donor</h1>
        <p className="mt-1 text-muted-foreground">Fill in your details to become a blood donor</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Blood Group *</label>
            <select
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="City"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Area *</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Area / Locality"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last Blood Donation Date</label>
            <input
              type="date"
              value={form.last_donation}
              onChange={(e) => setForm({ ...form, last_donation: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {form.last_donation && (
              <div className="mt-2 flex items-center gap-2">
                <EligibilityBadge eligible={eligible} />
                {days !== null && (
                  <span className="text-xs text-muted-foreground">
                    {days} days since last donation
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <button
              type="button"
              onClick={captureLocation}
              disabled={locLoading}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {locLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {location ? "Location Captured ✓" : "Capture My Location"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Register as Donor
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDonor;
