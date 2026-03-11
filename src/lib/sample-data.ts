import { Donor } from "./donors";

export const SAMPLE_DONORS: Omit<Donor, "id" | "user_id" | "created_at">[] = [
  { name: "Rahul Sharma", phone: "9876543210", blood_group: "O+", city: "Mumbai", area: "Andheri", last_donation: "2025-11-01", available: true, latitude: 19.1136, longitude: 72.8697 },
  { name: "Priya Patel", phone: "9876543211", blood_group: "A+", city: "Mumbai", area: "Bandra", last_donation: "2025-08-15", available: true, latitude: 19.0596, longitude: 72.8295 },
  { name: "Amit Kumar", phone: "9876543212", blood_group: "B+", city: "Delhi", area: "Connaught Place", last_donation: "2026-02-01", available: false, latitude: 28.6315, longitude: 77.2167 },
  { name: "Sneha Reddy", phone: "9876543213", blood_group: "AB+", city: "Bangalore", area: "Koramangala", last_donation: null, available: true, latitude: 12.9352, longitude: 77.6245 },
  { name: "Vikram Singh", phone: "9876543214", blood_group: "O-", city: "Mumbai", area: "Andheri", last_donation: "2025-06-10", available: true, latitude: 19.1197, longitude: 72.8464 },
  { name: "Neha Gupta", phone: "9876543215", blood_group: "A-", city: "Delhi", area: "Saket", last_donation: "2025-12-20", available: true, latitude: 28.5244, longitude: 77.2066 },
  { name: "Karthik Nair", phone: "9876543216", blood_group: "B-", city: "Bangalore", area: "Indiranagar", last_donation: "2025-09-05", available: false, latitude: 12.9784, longitude: 77.6408 },
  { name: "Anjali Mehta", phone: "9876543217", blood_group: "AB-", city: "Mumbai", area: "Bandra", last_donation: "2025-10-15", available: true, latitude: 19.0544, longitude: 72.8402 },
  { name: "Ravi Verma", phone: "9876543218", blood_group: "O+", city: "Delhi", area: "Connaught Place", last_donation: "2026-01-10", available: true, latitude: 28.6328, longitude: 77.2197 },
  { name: "Pooja Iyer", phone: "9876543219", blood_group: "A+", city: "Bangalore", area: "Whitefield", last_donation: "2025-07-22", available: true, latitude: 12.9698, longitude: 77.7500 },
];
