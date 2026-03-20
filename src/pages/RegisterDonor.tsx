import { useState } from "react";
import { toast } from "sonner";
import { BLOOD_GROUPS, DISEASES, type Disease } from "@/lib/donors";
import { getEligibilityStatus, daysSinceLastDonation } from "@/lib/eligibility";
import { getCurrentPosition } from "@/lib/geo";
import EligibilityBadge from "@/components/EligibilityBadge";
import { Loader2, MapPin, User, Stethoscope, Navigation, ToggleLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

const RegisterDonor = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    age: "",
    gender: "" as "" | "Male" | "Female" | "Other",
    blood_group: "",
    weight: "",
    last_donation: "",
    health_condition: "Healthy" as "Healthy" | "Not Healthy",
    diseases: ["None"] as Disease[],
    city: "",
    area: "",
    available: true,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eligibility = getEligibilityStatus({
    age: Number(form.age) || 0,
    weight: Number(form.weight) || 0,
    health_condition: form.health_condition,
    diseases: form.diseases,
    last_donation: form.last_donation || null,
  });
  const days = daysSinceLastDonation(form.last_donation || null);

  const toggleDisease = (d: Disease) => {
    if (d === "None") {
      setForm({ ...form, diseases: ["None"] });
    } else {
      const without = form.diseases.filter((x) => x !== "None");
      const has = without.includes(d);
      const updated = has ? without.filter((x) => x !== d) : [...without, d];
      setForm({ ...form, diseases: updated.length === 0 ? ["None"] : updated });
    }
  };

  const captureLocation = async () => {
    setLocLoading(true);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);

      // Perform Reverse Geocoding
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.lat}&longitude=${pos.lng}&localityLanguage=en`);
        if (response.ok) {
          const data = await response.json();
          // Fallback through location properties usually provided by BigDataCloud
          const city = data.city || data.principalSubdivision || "";
          const area = data.locality || "";

          setForm(prev => ({
            ...prev,
            city: city,
            area: area
          }));

          toast.success("Location captured and auto-filled!");
        } else {
          toast.success("Location captured! Please enter city manually.");
        }
      } catch (geocodeError) {
        console.error("Geocoding failed:", geocodeError);
        toast.success("Location captured! Please enter city manually.");
      }

    } catch {
      toast.error("Could not get your location. Please allow location access.");
    }
    setLocLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password || !form.age || !form.gender || !form.blood_group || !form.weight || !form.city || !form.area) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      toast.error(authError.message);
      setSubmitting(false);
      return;
    }

    if (!authData.user) {
      toast.error("An unknown error occurred creating the account.");
      setSubmitting(false);
      return;
    }

    // 2. Insert donor profile
    const { error: dbError } = await supabase.from("donors").insert({
      user_id: authData.user.id,
      name: form.name,
      phone: form.phone,
      age: Number(form.age),
      gender: form.gender,
      blood_group: form.blood_group,
      weight: Number(form.weight),
      city: form.city,
      area: form.area,
      last_donation: form.last_donation || null,
      health_condition: form.health_condition,
      diseases: form.diseases,
      available: form.available,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
    });

    setSubmitting(false);

    if (dbError) {
      toast.error(dbError.message);
      return;
    }

    toast.success("Donor registration successful! Thank you for saving lives.");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
        <div className="rounded-full bg-success/10 p-4">
          <svg className="h-12 w-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold">Registration Complete!</h2>
        <p className="mt-2 text-muted-foreground">You are now registered as a blood donor.</p>
        <EligibilityBadge status={eligibility} className="mt-3 text-sm mb-6" />
        <Link to="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold animate-fade-in">Register as a Donor</h1>
        <p className="mt-1 text-muted-foreground animate-fade-in stagger-1">Fill in your details to become a blood donor</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Personal Information */}
          <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-1">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <User className="h-4 w-4" /> Personal Information
            </legend>
            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Enter your full name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 9876543210"
                    inputMode="tel"
                    pattern="[0-9]{10,}"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputClass}
                    placeholder="Enter a password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Age *</label>
                  <input type="number" min={1} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputClass} placeholder="Age" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Gender *</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Weight (kg) *</label>
                  <input type="number" min={1} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputClass} placeholder="kg" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Blood Group *</label>
                <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className={inputClass}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Medical Information */}
          <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-2">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <Stethoscope className="h-4 w-4" /> Medical Information
            </legend>
            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Last Blood Donation Date</label>
                <input type="date" value={form.last_donation} onChange={(e) => setForm({ ...form, last_donation: e.target.value })} className={inputClass} />
                {form.last_donation && days !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">{days} days since last donation</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Health Condition *</label>
                <div className="flex gap-2">
                  {(["Healthy", "Not Healthy"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, health_condition: val })}
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-all ${form.health_condition === val
                        ? val === "Healthy" ? "bg-success/10 border-success text-success" : "bg-destructive/10 border-destructive text-destructive"
                        : "hover:bg-muted"
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Diseases</label>
                <div className="flex flex-wrap gap-2">
                  {DISEASES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDisease(d)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${form.diseases.includes(d)
                        ? d === "None" ? "bg-success/10 border-success text-success" : "bg-destructive/10 border-destructive text-destructive"
                        : "hover:bg-muted"
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {/* Live Eligibility Preview */}
              <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Eligibility Status:</span>
                <EligibilityBadge status={eligibility} />
              </div>
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-3">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <Navigation className="h-4 w-4" /> Location
            </legend>
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">City *</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="City" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Area *</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={inputClass} placeholder="Area / Locality" />
                </div>
              </div>
              <button type="button" onClick={captureLocation} disabled={locLoading} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                {locLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {location ? "Location Captured ✓" : "Capture GPS Location"}
              </button>
            </div>
          </fieldset>

          {/* Availability */}
          <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-4">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <ToggleLeft className="h-4 w-4" /> Availability
            </legend>
            <div className="mt-3 flex items-center justify-between">
              <label htmlFor="available-switch" className="text-sm font-medium">Available for Emergency Donation?</label>
              <Switch
                id="available-switch"
                checked={form.available}
                onCheckedChange={(val) => setForm({ ...form, available: val })}
                className="h-7 w-12 data-[state=checked]:bg-success data-[state=unchecked]:bg-muted"
              />
            </div>
          </fieldset>

          <button disabled={submitting} type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Register as Donor
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDonor;
