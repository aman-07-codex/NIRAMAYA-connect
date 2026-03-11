import { Phone, MapPin, Award } from "lucide-react";
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
      "relative rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md",
      emergency && donor.available && donor.eligible && "border-emergency bg-emergency-bg pulse-emergency"
    )}
  >
    {donor.bestMatch && (
      <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
        <Award className="h-3 w-3" /> Best Match
      </span>
    )}
    {emergency && donor.available && donor.eligible && (
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
      <EligibilityBadge eligible={donor.eligible} />
      <AvailabilityBadge available={donor.available} />
      {donor.distance !== null && (
        <span className="text-xs text-muted-foreground">
          ~{donor.distance.toFixed(1)} km away
        </span>
      )}
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
