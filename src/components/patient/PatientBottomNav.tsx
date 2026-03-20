import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  ClipboardList,
  Bot,
  MapPin,
} from "lucide-react";

const navItems = [
  {
    to: "/patient/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    to: "/patient/request",
    label: "Request",
    icon: Droplets,
  },
  {
    to: "/patient/requests",
    label: "History",
    icon: ClipboardList,
  },
  {
    to: "/patient/ai",
    label: "AI",
    icon: Bot,
  },
  {
    to: "/patient/nearby",
    label: "Nearby",
    icon: MapPin,
  },
];

const PatientBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/patient/dashboard"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary scale-110"
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
                    <div className="h-[3px] w-4 rounded-full bg-primary mt-0.5" />
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

export default PatientBottomNav;
