import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  ClipboardList,
  Bot,
  MapPin,
  LogOut,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";

const navItems = [
  {
    to: "/patient/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/patient/request",
    label: "Request Blood",
    icon: Droplets,
  },
  {
    to: "/patient/requests",
    label: "My Requests",
    icon: ClipboardList,
  },
  {
    to: "/patient/ai",
    label: "AI Assistant",
    icon: Bot,
  },
  {
    to: "/patient/nearby",
    label: "Nearby Help",
    icon: MapPin,
  },
];

const PatientSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold font-brand text-primary whitespace-nowrap">
            NIRA<span className="text-secondary">MAYA</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/patient/dashboard"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center px-2" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-3 space-y-1">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </div>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title="Logout"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;
