import { useState } from "react";
import { User, Droplets, Calendar, MapPin } from "lucide-react";
import EligibilityBadge from "@/components/EligibilityBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { isEligible, daysSinceLastDonation } from "@/lib/eligibility";
import { toast } from "sonner";

const Dashboard = () => {
  const [donor, setDonor] = useState({
    name: "Rahul Sharma",
    phone: "9876543210",
    blood_group: "O+",
    city: "Mumbai",
    area: "Andheri",
    last_donation: "2025-11-01",
    available: true,
  });

  const eligible = isEligible(donor.last_donation);
  const days = daysSinceLastDonation(donor.last_donation);

  const toggleAvailability = () => {
    setDonor((prev) => ({ ...prev, available: !prev.available }));
    toast.success(`Status updated to ${donor.available ? "Busy" : "Available"}`);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Donor Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Manage your donor profile and availability</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{donor.name}</h2>
              <p className="text-sm text-muted-foreground">{donor.phone}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Blood Group</span>
              <span className="font-bold text-primary text-lg">{donor.blood_group}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Location
              </span>
              <span className="text-sm font-medium">{donor.area}, {donor.city}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Status</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Eligibility</span>
              <EligibilityBadge eligible={eligible} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Availability</span>
              <AvailabilityBadge available={donor.available} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Last Donation
              </span>
              <span className="text-sm font-medium">
                {donor.last_donation || "Never"} {days !== null && `(${days} days ago)`}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                donor.available
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-success text-success-foreground hover:bg-success/90"
              }`}
            >
              {donor.available ? "Set as Busy" : "Set as Available"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
