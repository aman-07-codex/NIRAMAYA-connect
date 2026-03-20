import { useNavigate } from "react-router-dom";
import { LogOut, User, Hospital, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const HospitalTopNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hospitalName, setHospitalName] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("hospitals")
        .select("hospital_name")
        .eq("id", user.id)
        .single();
      if (data) setHospitalName(data.hospital_name);
    };
    fetchName();
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 md:px-6">
      {/* Left — Brand (mobile only since desktop has sidebar) */}
      <div className="flex items-center gap-2 md:hidden">
        <img
          src="/logo.png"
          onError={(e) => (e.currentTarget.src = logo)}
          alt="NIRAMAYA"
          className="h-9 w-9 object-contain"
        />
        <span className="text-lg font-bold font-brand text-primary">
          NIRA<span className="text-secondary">MAYA</span>
        </span>
      </div>

      {/* Center — Page context (desktop) */}
      <div className="hidden md:flex items-center gap-2">
        <Hospital className="h-5 w-5 text-emerald-600" />
        <span className="text-sm font-medium text-muted-foreground">
          Hospital Dashboard
        </span>
      </div>

      {/* Right — Profile & Logout */}
      <div className="flex items-center gap-2">
        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Hospital className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline max-w-[150px] truncate">
              {hospitalName || "Hospital Admin"}
            </span>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border shadow-xl py-2 z-50 animate-fade-in-up origin-top-right">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold truncate">
                  {hospitalName || "Hospital"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/hospital/profile");
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Hospital Profile
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HospitalTopNav;
