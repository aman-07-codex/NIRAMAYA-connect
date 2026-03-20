import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  animationClass?: string;
  glowClass?: string;
  bgClass?: string;
}

const StatsCard = ({ title, value, icon: Icon, className, iconClassName, animationClass, glowClass, bgClass }: Props) => (
  <div className={cn("rounded-lg border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300", className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
      </div>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl hover:scale-110 transition-all duration-300", bgClass || "bg-primary/10", glowClass, iconClassName)}>
        <Icon className={cn("h-6 w-6 text-primary", animationClass)} strokeWidth={2} />
      </div>
    </div>
  </div>
);

export default StatsCard;

