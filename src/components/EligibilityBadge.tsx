import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/donors";

interface Props {
  status: EligibilityStatus;
  className?: string;
}

const CONFIG: Record<EligibilityStatus, { label: string; classes: string }> = {
  eligible: { label: "🟢 Eligible", classes: "bg-success/10 text-success" },
  soon: { label: "🟡 Soon Eligible", classes: "bg-warning/10 text-warning" },
  not_eligible: { label: "🔴 Not Eligible", classes: "bg-destructive/10 text-destructive" },
};

const EligibilityBadge = ({ status, className }: Props) => {
  const c = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", c.classes, className)}>
      {c.label}
    </span>
  );
};

export default EligibilityBadge;
