import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { Building2, Phone, MapPin, Mail, Clock, RefreshCw } from "lucide-react";

type HospitalProfile = {
  hospital_name: string;
  registration_number: string;
  hospital_type: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
  blood_bank_available: boolean;
  emergency_services: boolean;
  description: string;
};

const HospitalProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("hospitals")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">
          Hospital Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your hospital's public information.
        </p>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-emerald-600/10 p-6 md:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Building2 className="h-10 w-10" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{profile.hospital_name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center rounded-full bg-background border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                ID: {profile.registration_number}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {profile.hospital_type}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Email Address</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Phone Number</div>
                    <div className="text-sm text-muted-foreground">{profile.phone}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Location</h3>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">{profile.city}, {profile.pincode}</div>
                  <div className="text-sm text-muted-foreground mt-1">{profile.address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Facilities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Blood Bank</span>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${profile.blood_bank_available ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {profile.blood_bank_available ? "Available" : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Emergency Services</span>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${profile.emergency_services ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {profile.emergency_services ? "Available" : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {profile.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;
