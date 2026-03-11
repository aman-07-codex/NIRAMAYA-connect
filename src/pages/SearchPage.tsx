import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, AlertTriangle, Droplets } from "lucide-react";
import { SAMPLE_DONORS } from "@/lib/sample-data";
import { BLOOD_GROUPS, DonorWithMeta } from "@/lib/donors";
import { isEligible } from "@/lib/eligibility";
import { haversineDistance, getCurrentPosition } from "@/lib/geo";
import DonorCard from "@/components/DonorCard";

const CITIES = [...new Set(SAMPLE_DONORS.map((d) => d.city))];
const AREAS = [...new Set(SAMPLE_DONORS.map((d) => d.area))];

const SearchPage = () => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition().then(setUserPos).catch(() => {});
  }, []);

  const results: DonorWithMeta[] = useMemo(() => {
    let donors = SAMPLE_DONORS.map((d) => {
      const eligible = isEligible(d.last_donation);
      const distance =
        userPos && d.latitude && d.longitude
          ? haversineDistance(userPos.lat, userPos.lng, d.latitude, d.longitude)
          : null;
      return { ...d, id: d.phone, user_id: "", created_at: "", eligible, distance, bestMatch: false };
    });

    // Filter
    if (bloodGroup) donors = donors.filter((d) => d.blood_group === bloodGroup);
    if (city) donors = donors.filter((d) => d.city === city);
    if (area) donors = donors.filter((d) => d.area === area);

    // Sort: available > eligible > same area > distance > recency
    donors.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (area && a.area !== b.area) return a.area === area ? -1 : 1;
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0;
    });

    // Mark best match
    if (donors.length > 0) {
      const top = donors[0];
      if (top.available && top.eligible) {
        donors[0] = { ...top, bestMatch: true };
      }
    }

    return donors;
  }, [bloodGroup, city, area, userPos]);

  const filteredForDisplay = emergency ? results.filter((d) => d.available) : results;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Find a Blood Donor</h1>
        <p className="mt-1 text-muted-foreground">Search by blood group and location to find nearby donors</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Blood Group</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Areas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setEmergency(!emergency)}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            emergency
              ? "bg-emergency text-primary-foreground pulse-emergency"
              : "border border-emergency text-emergency hover:bg-emergency-bg"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          {emergency ? "Emergency ON" : "Emergency"}
        </button>
      </div>

      {/* Results */}
      {filteredForDisplay.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Droplets className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">No donors found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForDisplay.map((donor) => (
            <DonorCard key={donor.id} donor={donor} emergency={emergency} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
