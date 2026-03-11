import { differenceInDays } from "date-fns";

export function isEligible(lastDonationDate: string | null): boolean {
  if (!lastDonationDate) return true;
  return differenceInDays(new Date(), new Date(lastDonationDate)) >= 90;
}

export function daysSinceLastDonation(lastDonationDate: string | null): number | null {
  if (!lastDonationDate) return null;
  return differenceInDays(new Date(), new Date(lastDonationDate));
}
