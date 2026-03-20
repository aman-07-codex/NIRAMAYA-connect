import { Users, Heart, Shield, Droplets } from "lucide-react";
import { SAMPLE_DONORS } from "@/lib/sample-data";
import { BLOOD_GROUPS } from "@/lib/donors";
import { isEligible } from "@/lib/eligibility";
import StatsCard from "@/components/StatsCard";

const StatsPage = () => {
  const total = SAMPLE_DONORS.length;
  const available = SAMPLE_DONORS.filter((d) => d.available).length;
  const eligible = SAMPLE_DONORS.filter((d) => isEligible(d.last_donation)).length;

  const groupCounts = BLOOD_GROUPS.map((g) => ({
    group: g,
    count: SAMPLE_DONORS.filter((d) => d.blood_group === g).length,
  }));

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Statistics</h1>
      <p className="mt-1 text-muted-foreground">Platform-wide donor analytics</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Total Donors" value={total} icon={Users} />
        <StatsCard title="Available Now" value={available} icon={Heart} />
        <StatsCard title="Eligible Donors" value={eligible} icon={Shield} />
      </div>

      <h2 className="mt-10 text-xl font-bold">Blood Group Distribution</h2>
      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {groupCounts.map((gc) => (
          <div
            key={gc.group}
            className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">{gc.group}</span>
            </div>
            <span className="text-2xl font-extrabold text-primary">{gc.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;
