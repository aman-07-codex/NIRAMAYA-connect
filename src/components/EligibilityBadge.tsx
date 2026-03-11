import { cn } from "@/lib/utils";

interface Props {
  eligible: boolean;
  className?: string;
}

const EligibilityBadge = ({ eligible, className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      eligible
        ? "bg-success/10 text-success"
        : "bg-warning/10 text-warning",
      className
    )}
  >
    {eligible ? "Eligible" : "Not Eligible"}
  </span>
);

export default EligibilityBadge;
