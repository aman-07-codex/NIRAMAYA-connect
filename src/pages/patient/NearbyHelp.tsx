import { useState, useEffect } from "react";
import { MapPin, Navigation, Building2, Phone, Clock, Loader2, Navigation2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Facility {
  id: string;
  name: string;
  type: string;
  phone: string;
  operating_hours: string;
  latitude: number;
  longitude: number;
  address: string;
  distance?: number;
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearbyHelp = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("nearby_facilities").select("*");
      if (error) throw error;
      
      let fetchedFacilities = data as Facility[];
      
      // Default state without distances
      fetchedFacilities = fetchedFacilities.map(f => ({
        ...f,
        distance: undefined
      }));
      
      setFacilities(fetchedFacilities);
    } catch (err) {
      console.error("Failed to fetch nearby facilities", err);
      toast.error("Failed to load facilities directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Update distances and sort
        const updatedFacilities = facilities.map(f => ({
          ...f,
          distance: calculateDistance(latitude, longitude, f.latitude, f.longitude)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setFacilities(updatedFacilities);
        setDetectingLocation(false);
        toast.success("Location detected successfully!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Please allow location access to find nearby help.");
        setDetectingLocation(false);
      }
    );
  };

  const getStyleForType = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes("blood bank")) return { icon: Building2, color: "from-rose-500 to-red-600", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700" };
    if (lower.includes("ngo")) return { icon: Building2, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700" };
    return { icon: Building2, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700" };
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          Nearby Help
        </h1>
        <p className="text-muted-foreground mt-2">
          Find blood banks, NGOs, and hospitals near your current location instantly.
        </p>
      </div>

      {/* Location Bar */}
      <div className="flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-sm animate-fade-in-up stagger-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Navigation className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Your Location</p>
          <p className="text-xs text-muted-foreground truncate">
            {userLocation 
              ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
              : "Detect location to sort to the nearest centers"}
          </p>
        </div>
        <button 
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-70"
        >
          {detectingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation2 className="h-4 w-4" />
          )}
          {detectingLocation ? "Detecting..." : "Detect"}
        </button>
      </div>

      {/* Nearby List */}
      <div className="space-y-4 animate-fade-in-up stagger-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-3xl border bg-card p-6 shadow-sm animate-pulse flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 w-1/3 rounded-md bg-muted" />
                  <div className="h-4 w-1/4 rounded-md bg-muted" />
                  <div className="h-4 w-1/2 rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/10">
            No facilities found. Make sure the database is populated via the Supabase SQL editor.
          </div>
        ) : (
          facilities.map((item) => {
            const style = getStyleForType(item.type);
            const Icon = style.icon;
            
            return (
              <div
                key={item.id}
                className={`group rounded-3xl border ${style.bg} p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover:border-black/10 dark:hover:border-white/10`}
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.color} text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-bold text-base truncate">{item.name}</h3>
                      {item.distance !== undefined && (
                        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold bg-background text-foreground rounded-full px-3 py-1.5 border shadow-sm self-start sm:self-auto">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {item.distance < 1 ? "Less than 1 km" : `${item.distance.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-xs font-bold uppercase tracking-wider mt-1.5 ${style.text}`}>
                      {item.type}
                    </p>
                    
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {item.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-foreground/50" /> {item.phone || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-foreground/50" /> {item.operating_hours || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NearbyHelp;
