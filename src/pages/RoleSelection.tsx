import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Droplets,
  Building2,
  Hospital,
  ArrowRight,
} from "lucide-react";

const roles = [
  {
    id: "patient",
    title: "Patient",
    description: "Register as a patient to request blood, find donors, and manage your health profile.",
    icon: HeartPulse,
    color: "from-rose-500 to-red-600",
    glow: "shadow-rose-500/20",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/40",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    route: "/register-patient",
  },
  {
    id: "donor",
    title: "Donor",
    description: "Become a blood donor and save lives. Register your availability and health details.",
    icon: Droplets,
    color: "from-red-500 to-pink-600",
    glow: "shadow-red-500/20",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/40",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    route: "/register-donor",
  },
  {
    id: "ngo",
    title: "NGO / Blood Bank",
    description: "Manage blood inventory, respond to emergencies, and coordinate with donors.",
    icon: Building2,
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    route: "/ngo-register",
  },
  {
    id: "hospital",
    title: "Hospital",
    description: "Manage blood requirements, place bulk requests, and track transfusion history.",
    icon: Hospital,
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/40",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    route: "/register-hospital",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
};

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (role: (typeof roles)[0]) => {
    if (role.route) {
      navigate(role.route);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex items-center justify-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/5 blur-3xl animate-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/3 to-secondary/3 blur-3xl" />
      </div>

      <div className="relative container py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4 bg-background/80 backdrop-blur-sm">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            Welcome to NIRAMAYA
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How would you like to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              get started
            </span>
            ?
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Select your role to create an account. Each role is tailored with
            features designed specifically for your needs.
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            const isComingSoon = !role.route;

            return (
              <motion.button
                key={role.id}
                variants={item}
                whileHover={
                  isComingSoon
                    ? {}
                    : { y: -6, scale: 1.02, transition: { duration: 0.2 } }
                }
                whileTap={isComingSoon ? {} : { scale: 0.98 }}
                onClick={() => handleSelect(role)}
                disabled={isComingSoon}
                className={`group relative flex flex-col items-center text-center rounded-2xl border ${role.border} ${role.bg} p-6 transition-all duration-300 hover:shadow-xl ${role.glow} backdrop-blur-sm ${
                  isComingSoon
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${role.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon
                    className={`h-8 w-8 bg-gradient-to-br ${role.color} bg-clip-text`}
                    style={{
                      stroke: `url(#grad-${role.id})`,
                    }}
                  />
                  {/* SVG gradient defs */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient
                        id={`grad-${role.id}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          className={
                            role.id === "patient"
                              ? "text-rose-500"
                              : role.id === "donor"
                              ? "text-red-500"
                              : role.id === "ngo"
                              ? "text-blue-500"
                              : "text-emerald-500"
                          }
                          style={{ stopColor: "currentColor" }}
                        />
                        <stop
                          offset="100%"
                          className={
                            role.id === "patient"
                              ? "text-red-600"
                              : role.id === "donor"
                              ? "text-pink-600"
                              : role.id === "ngo"
                              ? "text-indigo-600"
                              : "text-teal-600"
                          }
                          style={{ stopColor: "currentColor" }}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-1.5">{role.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground mb-4">
                  {role.description}
                </p>

                {/* CTA */}
                {isComingSoon ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                ) : (
                  <span
                    className={`mt-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${role.color} px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:gap-2.5`}
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </a>
        </motion.p>
      </div>
    </div>
  );
};

export default RoleSelection;
