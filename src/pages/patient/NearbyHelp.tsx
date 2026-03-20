import { MapPin, Navigation, Building2, Phone, Clock } from "lucide-react";

const nearbyItems = [
  {
    name: "City Blood Bank",
    type: "Blood Bank",
    distance: "1.2 km",
    phone: "+91 98765 43210",
    hours: "Open 24/7",
    icon: Building2,
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    name: "Red Cross Society",
    type: "NGO",
    distance: "2.8 km",
    phone: "+91 91234 56789",
    hours: "9 AM – 6 PM",
    icon: Building2,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    name: "District Hospital Blood Unit",
    type: "Hospital",
    distance: "3.5 km",
    phone: "+91 90000 12345",
    hours: "Open 24/7",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

const NearbyHelp = () => {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Nearby Help
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find blood banks, NGOs, and hospitals near your location.
        </p>
      </div>

      {/* Location Bar */}
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm animate-fade-in-up stagger-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Navigation className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Your Location</p>
          <p className="text-xs text-muted-foreground truncate">
            Enable location to find the nearest help centers
          </p>
        </div>
        <button className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Detect
        </button>
      </div>

      {/* Nearby List */}
      <div className="space-y-3 animate-fade-in-up stagger-2">
        {nearbyItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className={`rounded-2xl border ${item.bg} p-5 hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm truncate">{item.name}</h3>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground bg-background rounded-full px-2.5 py-0.5 border">
                      {item.distance}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.type}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {item.phone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {item.hours}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyHelp;
