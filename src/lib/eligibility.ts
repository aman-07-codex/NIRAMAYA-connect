import { differenceInDays } from "date-fns";
import type { Donor, EligibilityStatus, Disease } from "./donors";

export function getEligibilityStatus(donor: Pick<Donor, "age" | "weight" | "health_condition" | "diseases" | "last_donation">): EligibilityStatus {
  if (donor.age < 18) return "not_eligible";
  if (donor.weight < 50) return "not_eligible";
  if (donor.health_condition === "Not Healthy") return "not_eligible";

  const hasDiseases = donor.diseases.some((d) => d !== "None");
  if (hasDiseases) return "not_eligible";

  if (donor.last_donation) {
    const days = differenceInDays(new Date(), new Date(donor.last_donation));
    if (days < 90) return "soon";
  }

  return "eligible";
}

export function daysSinceLastDonation(lastDonationDate: string | null): number | null {
  if (!lastDonationDate) return null;
  return differenceInDays(new Date(), new Date(lastDonationDate));
}

// Keep backward compat
export function isEligible(lastDonationDate: string | null): boolean {
  if (!lastDonationDate) return true;
  return differenceInDays(new Date(), new Date(lastDonationDate)) >= 90;
}
