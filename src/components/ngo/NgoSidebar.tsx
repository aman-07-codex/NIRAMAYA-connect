import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, AlertCircle, BarChart3 } from "lucide-react";

export const NGO_LINKS = [
    { to: "/ngo-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/ngo-inventory", label: "Blood Inventory", icon: Database },
    { to: "/ngo-requests", label: "Emergency Requests", icon: AlertCircle },
    { to: "/ngo-analytics", label: "Analytics", icon: BarChart3 },
];

const NgoSidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-card hidden md:block min-h-[calc(100vh-5rem)]">
            <div className="p-4 py-6">
                <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4 px-4">NGO Portal</h2>
                <nav className="space-y-1">
                    {NGO_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default NgoSidebar;
