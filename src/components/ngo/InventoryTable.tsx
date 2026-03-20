import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Edit2, Trash2, AlertTriangle, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BLOOD_GROUPS } from "@/lib/donors";

type InventoryItem = {
    id: string;
    ngo_id: string;
    blood_group: string;
    units: number;
    expiry_date: string;
    storage_location: string;
    updated_at: string;
};

type InventoryTableProps = {
    ngoId: string;
};

const InventoryTable = ({ ngoId }: InventoryTableProps) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state for Add/Edit
    const [form, setForm] = useState<Partial<InventoryItem>>({});
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, [ngoId]);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .eq("ngo_id", ngoId)
            .order("blood_group", { ascending: true });

        if (error) {
            toast.error("Failed to load inventory");
        } else {
            setInventory(data || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.blood_group || form.units === undefined || !form.expiry_date || !form.storage_location) {
            toast.error("Please fill all required fields");
            return;
        }

        const payload = {
            ngo_id: ngoId,
            blood_group: form.blood_group,
            units: Number(form.units),
            expiry_date: form.expiry_date,
            storage_location: form.storage_location,
            updated_at: new Date().toISOString()
        };

        if (editingId) {
            // Update
            const { error } = await supabase
                .from("inventory")
                .update(payload)
                .eq("id", editingId);

            if (error) toast.error(error.message);
            else {
                toast.success("Inventory updated");
                setEditingId(null);
                fetchInventory();
            }
        } else {
            // Insert
            const { error } = await supabase
                .from("inventory")
                .insert(payload);

            if (error) toast.error(error.message);
            else {
                toast.success("Item added to inventory");
                setIsAdding(false);
                fetchInventory();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        const { error } = await supabase
            .from("inventory")
            .delete()
            .eq("id", id);

        if (error) toast.error(error.message);
        else {
            toast.success("Record deleted");
            fetchInventory();
        }
    };

    const startEditing = (item: InventoryItem) => {
        setIsAdding(false);
        setEditingId(item.id);
        setForm(item);
    };

    const startAdding = () => {
        setEditingId(null);
        setIsAdding(true);
        setForm({
            blood_group: "",
            units: 0,
            expiry_date: format(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // typical red blood cell shelf life
            storage_location: "Main Fridge"
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setForm({});
    };

    const inputClass = "w-full rounded-md border bg-background px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary";

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold tracking-tight">Current Stock Levels</h3>
                {!isAdding && !editingId && (
                    <button
                        onClick={startAdding}
                        className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Record
                    </button>
                )}
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Blood Group</th>
                                <th className="px-4 py-3 font-medium">Units Available</th>
                                <th className="px-4 py-3 font-medium">Expiry Date</th>
                                <th className="px-4 py-3 font-medium">Storage Location</th>
                                <th className="px-4 py-3 font-medium">Last Updated</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isAdding && (
                                <tr className="bg-muted/20 animate-fade-in">
                                    <td className="px-4 py-3">
                                        <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} className={inputClass}>
                                            <option value="">Select</option>
                                            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" min="0" value={form.units} onChange={e => setForm({ ...form, units: Number(e.target.value) })} className={inputClass} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className={inputClass} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" value={form.storage_location} onChange={e => setForm({ ...form, storage_location: e.target.value })} className={inputClass} />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground italic">Pending</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={handleSave} className="text-success hover:bg-success/10 p-1 rounded"><Save className="h-4 w-4" /></button>
                                        <button onClick={cancelEdit} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            )}

                            {inventory.length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No inventory records found. Click "Add Record" to start tracking.
                                    </td>
                                </tr>
                            )}

                            {inventory.map((item) => {
                                const isEditing = editingId === item.id;
                                const isLowStock = item.units < 5;
                                const isExpiringSoon = new Date(item.expiry_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                                if (isEditing) {
                                    return (
                                        <tr key={item.id} className="bg-muted/20">
                                            <td className="px-4 py-3">
                                                <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} className={inputClass}>
                                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input type="number" min="0" value={form.units} onChange={e => setForm({ ...form, units: Number(e.target.value) })} className={inputClass} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className={inputClass} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input type="text" value={form.storage_location} onChange={e => setForm({ ...form, storage_location: e.target.value })} className={inputClass} />
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{format(new Date(item.updated_at), "MMM d, yyyy")}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={handleSave} className="text-success hover:bg-success/10 p-1 rounded"><Save className="h-4 w-4" /></button>
                                                <button onClick={cancelEdit} className="text-muted-foreground hover:bg-muted p-1 rounded"><X className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-primary">{item.blood_group}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${isLowStock ? "text-destructive" : ""}`}>{item.units}</span>
                                                {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isExpiringSoon ? "text-warning font-medium flex items-center gap-1" : ""}>
                                                {format(new Date(item.expiry_date), "MMM d, yyyy")}
                                                {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{item.storage_location}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(item.updated_at), "MMM d, h:mm a")}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button onClick={() => startEditing(item)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1.5 rounded transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryTable;
