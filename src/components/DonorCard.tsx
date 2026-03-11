import { Phone, MapPin, Award, Star } from "lucide-react";
import { DonorWithMeta } from "@/lib/donors";
import EligibilityBadge from "./EligibilityBadge";
import AvailabilityBadge from "./AvailabilityBadge";
import { cn } from "@/lib/utils";

interface Props {
  donor: DonorWithMeta;
  emergency?: boolean;
}

const DonorCard = ({ donor, emergency }: Props) => (
  <div
    className={cn(
      "relative rounded-lg border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1",
      emergency && donor.available && donor.eligibility === "eligible" && "border-emergency bg-emergency-bg pulse-emergency"
    )}
  >
    {donor.bestMatch && (
      <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
        <Award className="h-3 w-3" /> Best Match
      </span>
    )}
    {emergency && donor.available && donor.eligibility === "eligible" && (
      <span className="absolute -top-2.5 left-3 inline-flex items-center rounded-full bg-emergency px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
        URGENT
      </span>
    )}

    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-card-foreground truncate">{donor.name}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{donor.area}, {donor.city}</span>
        </div>
      </div>
      <span className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
        {donor.blood_group}
      </span>
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-2">
      <EligibilityBadge status={donor.eligibility} />
      <AvailabilityBadge available={donor.available} />
      {donor.distance !== null && (
        <span className="text-xs text-muted-foreground">~{donor.distance.toFixed(1)} km</span>
      )}
    </div>

    {/* Match Score Bar */}
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Match Score</span>
        <span className="font-semibold text-foreground">{donor.matchScore}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            donor.matchScore >= 70 ? "bg-success" : donor.matchScore >= 40 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${donor.matchScore}%` }}
        />
      </div>
    </div>

    <div className="mt-4">
      <a
        href={`tel:${donor.phone}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Phone className="h-4 w-4" /> Call Donor
      </a>
    </div>
  </div>
);

export default DonorCard;
