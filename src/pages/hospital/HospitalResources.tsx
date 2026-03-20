import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { Activity, ArchiveRestore, BedDouble, Container, Wind, Settings2 } from "lucide-react";
import ResourceCard from "@/components/hospital/ResourceCard";
import UpdateResourceModal from "@/components/hospital/UpdateResourceModal";

type ResourceData = {
  id?: string;
  hospital_id: string;
  resource_type: string;
  available_units: number;
  last_updated: string;
};

// Configuration of supported hospital resources
const RESOURCE_CONFIG = [
  { type: "ICU_BEDS", title: "ICU Beds", icon: <BedDouble className="h-8 w-8" />, thresholds: { low: 5 } },
  { type: "GENERAL_BEDS", title: "General Beds", icon: <Container className="h-8 w-8" />, thresholds: { low: 15 } },
  { type: "MEDICAL_KITS", title: "Medical Kits", icon: <ArchiveRestore className="h-8 w-8" />, thresholds: { low: 20 } },
  { type: "VENTILATORS", title: "Ventilators", icon: <Wind className="h-8 w-8" />, thresholds: { low: 2 } },
  { type: "OXYGEN_CYLINDERS", title: "Oxygen Cylinders", icon: <Activity className="h-8 w-8" />, thresholds: { low: 10 } },
];

const HospitalResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Record<string, ResourceData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeResource, setActiveResource] = useState<{ type: string; title: string; count: number } | null>(null);

  const fetchResources = useCallback(async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("hospital_resources")
        .select("*")
        .eq("hospital_id", user.id);

      if (error) throw error;

      // Group as Record mapping resource_type -> ResourceData
      const mapped = (data || []).reduce((acc: Record<string, ResourceData>, item: ResourceData) => {
        acc[item.resource_type] = item;
        return acc;
      }, {});

      setResources(mapped);
    } catch (error: any) {
      toast.error("Failed to fetch resources");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResources(true);

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchResources(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchResources]);

  const openUpdateModal = (type: string, title: string, currentCount: number) => {
    setActiveResource({ type, title, count: currentCount });
    setIsModalOpen(true);
  };

  const handleSaveResource = async (newCount: number) => {
    if (!user || !activeResource) return;
    const { type, title } = activeResource;

    try {
      const { error } = await supabase
        .from("hospital_resources")
        .upsert({
          hospital_id: user.id,
          resource_type: type,
          available_units: newCount,
          last_updated: new Date().toISOString(),
        }, { onConflict: "hospital_id,resource_type" });

      if (error) throw error;

      toast.success(`${title} successfully updated!`);
      
      // Update local state cheerfully without full fetch
      setResources(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          resource_type: type,
          available_units: newCount,
          last_updated: new Date().toISOString(),
          hospital_id: user.id,
        }
      }));
      
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${title}`);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-muted/50 animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 bg-muted/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Check if we literally have 0 elements in DB to show empty state
  const hasEverAddedData = Object.keys(resources).length > 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Hospital Resources
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor and manage real-time availability of critical infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Auto-updating every 30s
        </div>
      </div>

      {!hasEverAddedData && (
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/5">
          <ArchiveRestore className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold">No resource data yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Click update on the cards below to input your initial hospital resource inventory.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_CONFIG.map((config) => {
          const res = resources[config.type];
          return (
            <ResourceCard
              key={config.type}
              title={config.title}
              type={config.type}
              icon={config.icon}
              thresholds={config.thresholds}
              count={res?.available_units || 0}
              lastUpdated={res?.last_updated || null}
              onUpdate={openUpdateModal}
            />
          );
        })}
      </div>

      {activeResource && (
        <UpdateResourceModal
          isOpen={isModalOpen}
          title={activeResource.title}
          currentCount={activeResource.count}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveResource}
        />
      )}
    </div>
  );
};

export default HospitalResources;
