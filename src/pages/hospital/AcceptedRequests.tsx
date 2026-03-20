import { Droplet, CheckCircle2 } from "lucide-react";

const AcceptedRequests = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">
          Accepted Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Requests currently assigned to your hospital.
        </p>
      </div>

      <div className="text-center py-20 border-2 border-dashed rounded-xl border-emerald-100 bg-emerald-50/50">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
        <h3 className="mt-4 text-lg font-semibold text-emerald-900">All managed nicely</h3>
        <p className="text-muted-foreground">Go to Blood Requests to accept new assignments.</p>
      </div>
    </div>
  );
};

export default AcceptedRequests;
