import { type DonorWithMeta, type BloodGroup } from "./donors";
import { toast } from "sonner";

export type PatientNeed = {
  blood_group: BloodGroup;
  city?: string;
  area?: string;
  requesterName?: string;
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

export async function notifyDonor(donor: DonorWithMeta, message: string): Promise<void> {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("NIRAMAYA Alert", { body: message, icon: "/favicon.ico" });
    } catch {}
  }
  toast.info("Donor Alert", {
    description: `${message} — ${donor.name} • ${donor.blood_group} • ${donor.city} ${donor.area}`,
    duration: 5000,
  });
}

export async function alertMatchingDonors(donors: DonorWithMeta[], need: PatientNeed): Promise<number> {
  const matches = donors.filter(
    (d) => d.available && d.eligibility === "eligible" && d.blood_group === need.blood_group,
  );
  for (const d of matches) {
    const msg = `Urgent need for ${need.blood_group}${need.city ? ` in ${need.city}` : ""}. Please respond if you can donate.`;
    await notifyDonor(d, msg);
  }
  toast.success(`Alerts sent to ${matches.length} ${matches.length === 1 ? "donor" : "donors"}`);
  return matches.length;
}

export function broadcastNeed(need: PatientNeed) {
  if (typeof window !== "undefined") {
    try {
      // BroadcastChannel for modern browsers
      // @ts-ignore
      const ch = "BroadcastChannel" in window ? new BroadcastChannel("donor-alerts") : null;
      if (ch) {
        ch.postMessage({ type: "ALERT", need, ts: Date.now() });
        ch.close();
      }
      // Fallback via storage event
      const payload = JSON.stringify({ type: "ALERT", need, ts: Date.now() });
      localStorage.setItem("donor-alerts", payload);
      localStorage.removeItem("donor-alerts");
    } catch {}
  }
}
