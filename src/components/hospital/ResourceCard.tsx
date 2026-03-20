import { ReactNode } from "react";
import { Clock, Edit2, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type ResourceThresholds = {
  low: number;
};

interface ResourceCardProps {
  title: string;
  type: string;
  count: number;
  lastUpdated: string | null;
  icon: ReactNode;
  thresholds: ResourceThresholds;
  onUpdate: (type: string, title: string, currentCount: number) => void;
}

const ResourceCard = ({ title, type, count, lastUpdated, icon, thresholds, onUpdate }: ResourceCardProps) => {
  const isLow = count < thresholds.low;
  const isMedium = count >= thresholds.low && count < thresholds.low * 2.5;

  let colorClasses = "bg-emerald-50 border-emerald-200 text-emerald-800";
  let iconColor = "text-emerald-600";
  let statusText = "Available";

  if (isLow) {
    colorClasses = "bg-rose-50 border-rose-200 text-rose-800";
    iconColor = "text-rose-600";
    statusText = "Low Capacity";
  } else if (isMedium) {
    colorClasses = "bg-amber-50 border-amber-200 text-amber-800";
    iconColor = "text-amber-600";
    statusText = "Medium Capacity";
  }

  const timeAgo = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) 
    : "Never updated";

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden ${colorClasses}`}>
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12 blur-3xl rounded-full w-32 h-32 bg-current" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-xl bg-white shadow-sm ${iconColor}`}>
          {icon}
        </div>
        {isLow && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 animate-pulse border border-rose-200 shadow-sm">
            <AlertTriangle className="h-3 w-3" />
            {statusText}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-1 relative z-10">
        <h3 className="font-semibold text-foreground/80">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black tabular-nums tracking-tight animate-fade-in-up">{count}</span>
          <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Units</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between relative z-10 pt-4 border-t border-current/10">
        <div className="flex items-center text-xs font-medium opacity-70">
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          {timeAgo}
        </div>
        <button
          onClick={() => onUpdate(type, title, count)}
          className="flex items-center gap-1.5 rounded-lg bg-white/60 hover:bg-white px-3 py-1.5 text-sm font-bold shadow-sm transition-colors active:scale-95"
        >
          <Edit2 className="h-4 w-4" />
          Update
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
