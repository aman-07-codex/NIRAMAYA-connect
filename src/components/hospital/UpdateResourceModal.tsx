import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface UpdateResourceModalProps {
  isOpen: boolean;
  title: string;
  currentCount: number;
  onClose: () => void;
  onSave: (newCount: number) => void;
}

const UpdateResourceModal = ({ isOpen, title, currentCount, onClose, onSave }: UpdateResourceModalProps) => {
  const [count, setCount] = useState<number>(currentCount);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCount(currentCount);
    }
  }, [isOpen, currentCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-card border shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b bg-muted/30">
          <h2 className="text-lg font-bold">Update {title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Available Count
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="h-12 w-12 rounded-xl border bg-muted flex items-center justify-center hover:bg-muted/80 text-xl font-bold transition-colors active:scale-95"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="h-14 flex-1 text-center text-3xl font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
            />
            <button
              onClick={() => setCount(count + 1)}
              className="h-12 w-12 rounded-xl border bg-muted flex items-center justify-center hover:bg-muted/80 text-xl font-bold transition-colors active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 border-t bg-muted/10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(count)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Check className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateResourceModal;
