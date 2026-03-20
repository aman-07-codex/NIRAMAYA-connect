import { useState } from "react";
import { LogOut, Activity, Users, Droplet, ArrowRight, HeartPulse } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Hospital Portal</h2>
              <p className="text-xs text-muted-foreground">Niramaya Healthcare System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm border py-1.5 px-3 rounded-full bg-background shadow-sm hidden sm:inline-block">
              {session?.user?.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              {isLoggingOut ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Manage your hospital's blood requirements, patient reports, and connections with nearby blood banks.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Active Requests</h3>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since yesterday</p>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Patients Managed</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">+18 this week</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Blood Inventory</h3>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">Critical</div>
              <p className="text-xs text-rose-500">Need O- blood urgently</p>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight text-xl">Welcome to your new Dashboard!</h3>
            <p className="text-sm text-muted-foreground">Here are a few things you can do next.</p>
          </div>
          <div className="p-6 pt-0">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div>
                  <h4 className="font-medium text-sm">Complete Profile</h4>
                  <p className="text-xs text-muted-foreground">Add your hospital logo and verify documents.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </li>
              <li className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div>
                  <h4 className="font-medium text-sm">Raise Blood Request</h4>
                  <p className="text-xs text-muted-foreground">Connect with donors instantly.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
