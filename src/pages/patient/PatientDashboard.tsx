import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Droplets,
  Search,
  Activity,
  Shield,
  Phone,
  MapPin,
  User,
  Loader2,
  BarChart3,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

interface PatientProfile {
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  phone: string;
  city: string;
  pincode: string;
  emergency_contact: string;
  existing_conditions: string | null;
}

const quickActions = [
  {
    title: "Request Blood",
    description: "Submit a blood requirement to donors and blood banks",
    icon: Search,
    to: "/patient/request",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    title: "My Requests",
    description: "Track your blood requests and their status",
    icon: AlertTriangle,
    to: "/patient/requests",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    title: "Nearby Help",
    description: "Find blood banks and hospitals near you",
    icon: BarChart3,
    to: "/patient/nearby",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    title: "AI Assistant",
    description: "Check symptoms and get instant advice",
    icon: Bot,
    to: "/patient/assistant",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfile(data as PatientProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {profile?.full_name || "Patient"}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Your patient dashboard — manage your health profile and find
                donors
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 animate-fade-in-up stagger-1">
            <div className="rounded-2xl border bg-card p-6 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-5">
                <User className="h-5 w-5 text-primary" />
                <h2 className="font-bold">Your Profile</h2>
              </div>

              {profile ? (
                <div className="space-y-4">
                  {/* Blood Group Badge */}
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-destructive text-white shadow-lg">
                      <div className="text-center">
                        <Droplets className="h-5 w-5 mx-auto mb-0.5" />
                        <span className="text-sm font-bold">
                          {profile.blood_group}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <ProfileRow
                      icon={<User className="h-4 w-4" />}
                      label="Name"
                      value={profile.full_name}
                    />
                    <ProfileRow
                      icon={<Activity className="h-4 w-4" />}
                      label="Age / Gender"
                      value={`${profile.age} yrs, ${profile.gender}`}
                    />
                    <ProfileRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={profile.phone}
                    />
                    <ProfileRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Location"
                      value={`${profile.city}, ${profile.pincode}`}
                    />
                    <ProfileRow
                      icon={<Shield className="h-4 w-4" />}
                      label="Emergency"
                      value={profile.emergency_contact}
                    />
                    {profile.existing_conditions && (
                      <ProfileRow
                        icon={<HeartPulse className="h-4 w-4" />}
                        label="Conditions"
                        value={profile.existing_conditions}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No profile data found.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-2">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.to}
                    className={`group rounded-2xl border ${action.bg} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white mb-3 shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <HeartPulse className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-sm">Health Status</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-600">Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile is active and visible to blood banks
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Droplets className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm">Blood Group</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {profile?.blood_group || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Compatible donors can be found via search
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

export default PatientDashboard;
