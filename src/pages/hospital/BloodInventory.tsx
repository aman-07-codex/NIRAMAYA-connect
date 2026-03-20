import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { Droplet, Plus, Minus, Save, RefreshCw } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

type InventoryItem = {
  blood_group: string;
  units: number;
};

const BloodInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("blood_inventory")
        .select("blood_group, units")
        .eq("hospital_id", user.id);

      if (error) throw error;

      // Map to Record<group, units>
      const invMap: Record<string, number> = {};
      BLOOD_GROUPS.forEach((bg) => {
        const found = data?.find((item) => item.blood_group === bg);
        invMap[bg] = found ? found.units : 0;
      });
      setInventory(invMap);
    } catch (error: any) {
      toast.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const handleAdjust = (group: string, delta: number) => {
    setInventory((prev) => ({
      ...prev,
      [group]: Math.max(0, prev[group] + delta),
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      
      const payload = Object.entries(inventory).map(([blood_group, units]) => ({
        hospital_id: user.id,
        blood_group,
        units,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("blood_inventory")
        .upsert(payload, { onConflict: "hospital_id, blood_group" });

      if (error) throw error;
      toast.success("Inventory updated successfully!");
    } catch (error: any) {
      toast.error("Failed to save inventory");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">
            Blood Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your available blood units.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 h-10 px-6 font-medium text-white shadow transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BLOOD_GROUPS.map((group) => {
          const units = inventory[group] || 0;
          return (
            <div
              key={group}
              className="bg-card rounded-xl border shadow-sm p-5 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group"
            >
              {units <= 5 && units > 0 && (
                <div className="absolute top-0 right-0 left-0 bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider py-0.5">
                  Low Stock
                </div>
              )}
              {units === 0 && (
                <div className="absolute top-0 right-0 left-0 bg-rose-500/10 text-rose-700 text-[10px] font-bold uppercase tracking-wider py-0.5">
                  Out of Stock
                </div>
              )}
              
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-red-600">{group}</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-bold text-card-foreground">
                  {units}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Units Available
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 w-full">
                <button
                  onClick={() => handleAdjust(group, -1)}
                  disabled={units === 0}
                  className="flex h-9 flex-1 items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-50 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAdjust(group, 1)}
                  className="flex h-9 flex-1 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BloodInventory;
