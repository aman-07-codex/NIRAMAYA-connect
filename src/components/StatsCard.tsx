import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

const StatsCard = ({ title, value, icon: Icon, className, iconClassName }: Props) => (
  <div className={cn("rounded-lg border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300", className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
      </div>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 hover:scale-110 transition-transform duration-200", iconClassName)}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default StatsCard;
