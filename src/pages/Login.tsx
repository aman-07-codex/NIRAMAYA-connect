import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  Droplets,
  HeartPulse,
  Building2,
  Hospital,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Role = "donor" | "patient" | "ngo" | "hospital";

const tabs: { id: Role; label: string; icon: typeof Droplets; color: string }[] = [
  { id: "donor", label: "Donor", icon: Droplets, color: "text-red-500" },
  { id: "patient", label: "Patient", icon: HeartPulse, color: "text-rose-500" },
  { id: "ngo", label: "NGO", icon: Building2, color: "text-blue-500" },
  { id: "hospital", label: "Hospital", icon: Hospital, color: "text-emerald-500" },
];

const roleConfig: Record<Role, { subtitle: string; redirect: string; registerLink: string; registerLabel: string }> = {
  donor: {
    subtitle: "Access your donor dashboard and manage donations",
    redirect: "/dashboard",
    registerLink: "/register-donor",
    registerLabel: "Register as Donor",
  },
  patient: {
    subtitle: "Manage your health profile and request blood",
    redirect: "/patient/dashboard",
    registerLink: "/register-patient",
    registerLabel: "Register as Patient",
  },
  ngo: {
    subtitle: "Manage blood inventory and coordinate with donors",
    redirect: "/ngo-dashboard",
    registerLink: "/ngo-register",
    registerLabel: "Register NGO",
  },
  hospital: {
    subtitle: "Manage blood requirements and transfusion records",
    redirect: "/hospital/dashboard",
    registerLink: "/select-role",
    registerLabel: "Register Hospital",
  },
};

const Login = () => {
  const [activeTab, setActiveTab] = useState<Role>("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const location = useLocation() as any;

  const config = roleConfig[activeTab];

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleTabSwitch = (tab: Role) => {
    setActiveTab(tab);
    setErrors({});
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Logged in as ${tabs.find((t) => t.id === activeTab)?.label}`);
    
    let to = location?.state?.from?.pathname || config.redirect;
    
    // If the intercepted route is just the generic /dashboard (which belongs to Donor) 
    // or root, force it to the role-specific dashboard so the user doesn't get stuck.
    if (to === "/dashboard" || to === "/" || to === "/login") {
      to = config.redirect;
    }
    
    navigate(to, { replace: true });
  };

  const inputBase =
    "w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all duration-200 outline-none";
  const inputNormal = `${inputBase} border-border focus:ring-2 focus:ring-primary/20 focus:border-primary`;
  const inputError = `${inputBase} border-destructive focus:ring-2 focus:ring-destructive/20 focus:border-destructive`;

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      {/* Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground mb-3 bg-background">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Secure Authentication
          </div>
          <h1 className="text-2xl font-bold">Sign in to NIRAMAYA</h1>
          <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border bg-card shadow-xl shadow-black/5 overflow-hidden">
          {/* Tab Bar */}
          <div className="grid grid-cols-4 border-b bg-muted/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`relative flex flex-col items-center gap-1 py-3.5 text-[11px] font-medium transition-all duration-300 ${
                    isActive
                      ? "text-primary bg-card"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 transition-all duration-300 ${
                      isActive ? tab.color + " scale-110" : ""
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={isActive ? "font-semibold" : ""}>{tab.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-10 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  className={`${errors.email ? inputError : inputNormal} pl-10`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                  onClick={() => toast.info("Reset password feature coming soon")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${errors.password ? inputError : inputNormal} pl-10 pr-10`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/85 px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {tabs.find((t) => t.id === activeTab)?.label}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-muted/20">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={config.registerLink}
                className="text-primary hover:underline font-semibold"
              >
                {config.registerLabel}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          By signing in, you agree to NIRAMAYA's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
