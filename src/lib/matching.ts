import type { DonorWithMeta } from "./donors";

/**
 * Rule-based matching score (0-100).
 * Factors: distance, availability, donation gap, eligibility, reliability.
 */
export function calculateMatchScore(donor: DonorWithMeta, searchArea?: string): number {
  let score = 0;

  // Availability (30 pts)
  if (donor.available) score += 30;

  // Eligibility (25 pts)
  if (donor.eligibility === "eligible") score += 25;
  else if (donor.eligibility === "soon") score += 10;

  // Distance (20 pts) — closer = higher
  if (donor.distance !== null) {
    if (donor.distance < 5) score += 20;
    else if (donor.distance < 15) score += 14;
    else if (donor.distance < 30) score += 8;
    else score += 2;
  }

  // Area match (10 pts)
  if (searchArea && donor.area === searchArea) score += 10;

  // Reliability (10 pts)
  score += Math.min(donor.reliability_score, 10);

  // Donation gap bonus (5 pts) — longer gap = better
  if (donor.last_donation) {
    const days = Math.floor((Date.now() - new Date(donor.last_donation).getTime()) / 86400000);
    if (days >= 180) score += 5;
    else if (days >= 90) score += 3;
  } else {
    score += 5; // never donated = full gap
  }

  return Math.min(score, 100);
}
