import { cn } from "@/lib/utils";

interface Props {
  available: boolean;
  className?: string;
}

const AvailabilityBadge = ({ available, className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      available
        ? "bg-success/10 text-success"
        : "bg-muted text-muted-foreground",
      className
    )}
  >
    {available ? "Available" : "Busy"}
  </span>
);

export default AvailabilityBadge;
