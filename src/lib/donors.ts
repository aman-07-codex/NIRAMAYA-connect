export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface Donor {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  blood_group: BloodGroup;
  city: string;
  area: string;
  last_donation: string | null;
  available: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface DonorWithMeta extends Donor {
  eligible: boolean;
  distance: number | null;
  bestMatch: boolean;
}
