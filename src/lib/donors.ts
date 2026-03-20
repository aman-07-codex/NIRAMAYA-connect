export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const DISEASES = ["Diabetes", "Blood Pressure", "Heart Disease", "None"] as const;
export type Disease = (typeof DISEASES)[number];

export type Gender = "Male" | "Female" | "Other";
export type EligibilityStatus = "eligible" | "soon" | "not_eligible";

export interface Donor {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  blood_group: BloodGroup;
  weight: number;
  city: string;
  area: string;
  last_donation: string | null;
  health_condition: "Healthy" | "Not Healthy";
  diseases: Disease[];
  available: boolean;
  latitude: number | null;
  longitude: number | null;
  reliability_score: number;
  created_at: string;
}

export interface DonorWithMeta extends Donor {
  eligibility: EligibilityStatus;
  distance: number | null;
  matchScore: number;
  bestMatch: boolean;
}
