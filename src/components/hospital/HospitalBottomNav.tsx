import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Droplet,
  AlertTriangle,
  ArchiveRestore,
} from "lucide-react";

const navItems = [
  {
    to: "/hospital/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    to: "/hospital/requests",
    label: "Requests",
    icon: ClipboardList,
  },
  {
    to: "/hospital/accepted",
    label: "Accepted",
    icon: CheckSquare,
  },
  {
    to: "/hospital/inventory",
    label: "Inventory",
    icon: Droplet,
  },
  {
    to: "/hospital/resources",
    label: "Resources",
    icon: ArchiveRestore,
  },
  {
    to: "/hospital/alerts",
    label: "Alerts",
    icon: AlertTriangle,
  },
];

const HospitalBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAlert = item.to.includes("alerts");
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/hospital/dashboard"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? isAlert ? "text-rose-600" : "text-emerald-700"
                    : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? isAlert ? "bg-rose-500/10 text-rose-600 scale-110" : "bg-emerald-600/10 text-emerald-700 scale-110"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`transition-all duration-200 ${
                      isActive ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={`h-[3px] w-4 rounded-full mt-0.5 ${isAlert ? "bg-rose-500" : "bg-emerald-600"}`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default HospitalBottomNav;
