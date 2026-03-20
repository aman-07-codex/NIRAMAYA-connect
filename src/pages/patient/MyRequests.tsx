import { ClipboardList, Inbox } from "lucide-react";

const MyRequests = () => {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          My Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all your blood requests and their current status.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 animate-fade-in-up stagger-1">
        {["All", "Active", "Fulfilled", "Expired"].map((tab, i) => (
          <button
            key={tab}
            className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-all ${
              i === 0
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground hover:bg-muted border-border"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up stagger-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No requests yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          When you submit a blood request, it will appear here with real-time status updates.
        </p>
      </div>
    </div>
  );
};

export default MyRequests;
