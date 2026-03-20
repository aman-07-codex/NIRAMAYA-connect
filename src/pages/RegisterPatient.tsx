import { useState } from "react";
import { toast } from "sonner";
import { BLOOD_GROUPS } from "@/lib/donors";
import {
  Loader2,
  User,
  HeartPulse,
  MapPin,
  Lock,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "" as "" | "Male" | "Female" | "Other",
    blood_group: "",
    phone: "",
    city: "",
    pincode: "",
    emergency_contact: "",
    existing_conditions: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 120)
      errs.age = "Enter a valid age (1–120)";
    if (!form.gender) errs.gender = "Select your gender";
    if (!form.blood_group) errs.blood_group = "Select your blood group";
    if (!form.phone || !/^\d{10,}$/.test(form.phone))
      errs.phone = "Enter a valid 10-digit phone number";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.pincode || !/^\d{6}$/.test(form.pincode))
      errs.pincode = "Enter a valid 6-digit pincode";
    if (
      !form.emergency_contact ||
      !/^\d{10,}$/.test(form.emergency_contact)
    )
      errs.emergency_contact = "Enter a valid emergency contact number";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    field: string,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    // 1. Sign up user via Supabase Auth
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

    // 2. Insert patient profile into patients table
    const { error: dbError } = await supabase.from("patients").insert({
      user_id: authData.user.id,
      full_name: form.full_name.trim(),
      age: Number(form.age),
      gender: form.gender,
      blood_group: form.blood_group,
      phone: form.phone,
      city: form.city.trim(),
      pincode: form.pincode,
      emergency_contact: form.emergency_contact,
      existing_conditions: form.existing_conditions.trim() || null,
    });

    setSubmitting(false);

    if (dbError) {
      toast.error(dbError.message);
      return;
    }

    toast.success("Registration successful! Welcome to NIRAMAYA.");
    navigate("/patient/dashboard");
  };

  const inputClass =
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none";
  const errorInputClass =
    "w-full rounded-lg border border-destructive bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-destructive/30 focus:border-destructive transition-all outline-none";

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        {msg}
      </p>
    ) : null;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <HeartPulse className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Patient Registration</h1>
            <p className="text-sm text-muted-foreground">
              Create your health profile to access NIRAMAYA services
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* ── Personal Information ── */}
          <fieldset className="rounded-xl border bg-card p-5 shadow-sm animate-fade-in-up stagger-1">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <User className="h-4 w-4" /> Personal Information
            </legend>
            <div className="mt-3 space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className={errors.full_name ? errorInputClass : inputClass}
                  placeholder="Enter your full name"
                />
                <FieldError msg={errors.full_name} />
              </div>

              {/* Age + Gender + Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Age <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className={errors.age ? errorInputClass : inputClass}
                    placeholder="Age"
                  />
                  <FieldError msg={errors.age} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Gender <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className={errors.gender ? errorInputClass : inputClass}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.gender} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Blood Group <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.blood_group}
                    onChange={(e) =>
                      handleChange("blood_group", e.target.value)
                    }
                    className={
                      errors.blood_group ? errorInputClass : inputClass
                    }
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.blood_group} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`${errors.phone ? errorInputClass : inputClass} pl-9`}
                    placeholder="e.g. 9876543210"
                    inputMode="tel"
                  />
                </div>
                <FieldError msg={errors.phone} />
              </div>
            </div>
          </fieldset>

          {/* ── Medical Details ── */}
          <fieldset className="rounded-xl border bg-card p-5 shadow-sm animate-fade-in-up stagger-2">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <HeartPulse className="h-4 w-4" /> Medical Details
            </legend>
            <div className="mt-3 space-y-4">
              {/* Emergency Contact */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Emergency Contact{" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.emergency_contact}
                    onChange={(e) =>
                      handleChange("emergency_contact", e.target.value)
                    }
                    className={`${errors.emergency_contact ? errorInputClass : inputClass} pl-9`}
                    placeholder="Emergency contact phone number"
                    inputMode="tel"
                  />
                </div>
                <FieldError msg={errors.emergency_contact} />
              </div>

              {/* Existing Conditions */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Existing Medical Conditions{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={form.existing_conditions}
                  onChange={(e) =>
                    handleChange("existing_conditions", e.target.value)
                  }
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="e.g. Diabetes, Hypertension, Thalassemia..."
                />
              </div>
            </div>
          </fieldset>

          {/* ── Location ── */}
          <fieldset className="rounded-xl border bg-card p-5 shadow-sm animate-fade-in-up stagger-3">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <MapPin className="h-4 w-4" /> Location
            </legend>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={errors.city ? errorInputClass : inputClass}
                  placeholder="Your city"
                />
                <FieldError msg={errors.city} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pincode <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  className={errors.pincode ? errorInputClass : inputClass}
                  placeholder="e.g. 110001"
                  inputMode="numeric"
                  maxLength={6}
                />
                <FieldError msg={errors.pincode} />
              </div>
            </div>
          </fieldset>

          {/* ── Account Setup ── */}
          <fieldset className="rounded-xl border bg-card p-5 shadow-sm animate-fade-in-up stagger-4">
            <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
              <Lock className="h-4 w-4" /> Account Setup
            </legend>
            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`${errors.email ? errorInputClass : inputClass} pl-9`}
                    placeholder="you@example.com"
                  />
                </div>
                <FieldError msg={errors.email} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`${errors.password ? errorInputClass : inputClass} pl-9`}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <FieldError msg={errors.password} />
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <button
            disabled={submitting}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.01] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create Patient Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5 mb-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPatient;
