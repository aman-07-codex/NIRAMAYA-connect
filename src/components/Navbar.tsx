import { Link, useLocation } from "react-router-dom";
import { Droplets, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/lib/AuthProvider";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Find Donor" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/stats", label: "Statistics" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { session, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" onError={(e) => (e.currentTarget.src = logo)} alt="NIRAMAYA" className="h-16 w-16 object-contain" />
          <span className="text-xl font-bold font-brand text-primary">NIRA<span className="text-secondary">MAYA</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <button
              onClick={signOut}
              className="ml-2 px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold border hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <Link
              to="/register-donor"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Become a Donor
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-card pb-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="mx-6 mt-2 flex w-[-webkit-fill-available] items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <Link
              to="/register-donor"
              onClick={() => setOpen(false)}
              className="mx-6 mt-2 block text-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground"
            >
              Become a Donor
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
