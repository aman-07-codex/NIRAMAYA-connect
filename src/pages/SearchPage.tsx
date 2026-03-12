import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Droplets, Trophy, Bell, Loader2, Building2 } from "lucide-react";
import { BLOOD_GROUPS, DonorWithMeta, Donor } from "@/lib/donors";
import { getEligibilityStatus } from "@/lib/eligibility";
import { haversineDistance, getCurrentPosition } from "@/lib/geo";
import { calculateMatchScore } from "@/lib/matching";
import DonorCard from "@/components/DonorCard";
import NgoCard, { NgoInventoryDisplay } from "@/components/NgoCard";
import { alertMatchingDonors, requestNotificationPermission, broadcastNeed } from "@/lib/alerts";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SearchPage = () => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const [rawDonors, setRawDonors] = useState<Donor[]>([]);
  const [rawNgoInventory, setRawNgoInventory] = useState<NgoInventoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive unique cities and areas from both donors and NGOs
  const cities = useMemo(() => {
    const donorCities = rawDonors.map((d) => d.city);
    const ngoCities = rawNgoInventory.map((i) => i.ngo.city);
    return [...new Set([...donorCities, ...ngoCities])];
  }, [rawDonors, rawNgoInventory]);

  const areas = useMemo(() => {
    const donorAreas = rawDonors.map((d) => d.area);
    // Note: NGOs don't currently have an 'area' specific field in schema, so we rely on donors
    return [...new Set(donorAreas)];
  }, [rawDonors]);

  useEffect(() => {
    getCurrentPosition().then(setUserPos).catch(() => { });

    const fetchData = async () => {
      setLoading(true);

      // Fetch Individual Donors
      const { data: donorData, error: donorError } = await supabase.from('donors').select('*');
      if (!donorError && donorData) {
        setRawDonors(donorData);
      }

      // Fetch NGO Inventory (only those with > 0 units)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          id, blood_group, units,
          ngos ( id, ngo_name, city, address, phone )
        `)
        .gt('units', 0);

      if (!inventoryError && inventoryData) {
        // Map to our expected display interface
        const mappedInventory = inventoryData.map((item: any) => ({
          inventory_id: item.id,
          blood_group: item.blood_group,
          units: item.units,
          ngo: {
            id: item.ngos.id,
            ngo_name: item.ngos.ngo_name,
            city: item.ngos.city,
            address: item.ngos.address,
            phone: item.ngos.phone
          }
        }));
        setRawNgoInventory(mappedInventory);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter DONORS
  const donorResults: DonorWithMeta[] = useMemo(() => {
    let donors: DonorWithMeta[] = rawDonors.map((d) => {
      const eligibility = getEligibilityStatus(d as any);
      const distance =
        userPos && d.latitude && d.longitude
          ? haversineDistance(userPos.lat, userPos.lng, d.latitude, d.longitude)
          : null;
      return {
        ...d,
        id: d.id,
        user_id: d.user_id || "",
        created_at: d.created_at || "",
        eligibility,
        distance,
        matchScore: 0,
        bestMatch: false,
      };
    });

    if (bloodGroup) donors = donors.filter((d) => d.blood_group === bloodGroup);
    if (city) donors = donors.filter((d) => d.city === city);
    if (area) donors = donors.filter((d) => d.area === area);

    donors = donors.map((d) => ({ ...d, matchScore: calculateMatchScore({ ...d, phone: d.phone }, area || undefined) }));
    donors.sort((a, b) => b.matchScore - a.matchScore);

    if (donors.length > 0 && donors[0].available && donors[0].eligibility === "eligible") {
      donors[0] = { ...donors[0], bestMatch: true };
    }

    return donors;
  }, [rawDonors, bloodGroup, city, area, userPos]);

  // Filter NGOs
  const ngoResults: NgoInventoryDisplay[] = useMemo(() => {
    let inventory = [...rawNgoInventory];

    if (bloodGroup) inventory = inventory.filter(inv => inv.blood_group === bloodGroup);
    if (city) inventory = inventory.filter(inv => inv.ngo.city === city);
    // Note: since ngos don't have area, if area is selected we might not filter them, or only show if address includes it
    if (area) inventory = inventory.filter(inv => inv.ngo.address.toLowerCase().includes(area.toLowerCase()));

    // Sort by largest units available
    inventory.sort((a, b) => b.units - a.units);

    return inventory;
  }, [rawNgoInventory, bloodGroup, city, area]);

  const filteredDonorsForDisplay = emergency ? donorResults.filter((d) => d.available) : donorResults;
  const topMatches = filteredDonorsForDisplay.filter((d) => d.matchScore >= 60).slice(0, 5);

  return (
    <div className="container py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold sm:text-3xl">Find a Blood Donor</h1>
        <p className="mt-1 text-muted-foreground">Search by blood group and location to find nearby donors and NGOs</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4 shadow-sm animate-fade-in-up stagger-1">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Blood Group</label>
          <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Area</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All Areas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button
          onClick={() => setEmergency(!emergency)}
          className={`inline-flex flex-1 md:flex-none justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${emergency
            ? "bg-emergency text-primary-foreground pulse-emergency"
            : "border border-emergency text-emergency hover:bg-emergency-bg"
            }`}
        >
          <AlertTriangle className="h-4 w-4" />
          {emergency ? "Emergency ON" : "Emergency"}
        </button>
        <button
          onClick={async () => {
            const granted = await requestNotificationPermission();
            const need = { blood_group: bloodGroup as any, city: city || undefined, area: area || undefined };
            const count = await alertMatchingDonors(filteredDonorsForDisplay, need);
            broadcastNeed(need);
            if (!granted) {
              toast.info("Browser notifications are blocked. In-app alerts were sent.");
            }
          }}
          disabled={!bloodGroup || filteredDonorsForDisplay.length === 0}
          className="inline-flex flex-1 md:flex-none justify-center items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          title="Send alerts to matching, eligible donors"
        >
          <Bell className="h-4 w-4" />
          Notify Matching Donors
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Blood Banks / NGOs Section */}
          {ngoResults.length > 0 && (
            <div className="mb-10 animate-fade-in-up stagger-2">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <Building2 className="h-5 w-5 text-primary" /> Verified Blood Banks & NGOs
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ngoResults.map((inv) => (
                  <div key={inv.inventory_id} className="animate-fade-in">
                    <NgoCard data={inv} emergency={emergency} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Matches Section (Individual Donors) */}
          {topMatches.length > 0 && (
            <div className="mb-8 animate-fade-in-up stagger-3">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <Trophy className="h-5 w-5 text-warning" /> Best Matches (Individuals)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topMatches.map((donor) => (
                  <DonorCard key={`top-${donor.id}`} donor={donor} emergency={emergency} />
                ))}
              </div>
            </div>
          )}

          {/* All Results */}
          <h2 className="text-lg font-bold mb-4 animate-fade-in">All Individual Donors ({filteredDonorsForDisplay.length})</h2>
          {filteredDonorsForDisplay.length === 0 && ngoResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Droplets className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No donors or blood banks found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDonorsForDisplay.map((donor, i) => (
                <div key={donor.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                  <DonorCard donor={donor} emergency={emergency} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
