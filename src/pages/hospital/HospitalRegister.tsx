import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Hospital,
  Building2,
  Phone,
  MapPin,
  Lock,
  Mail,
  Loader2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HospitalRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: "",
    registrationNumber: "",
    hospitalType: "Private",
    phone: "",
    email: "",
    city: "",
    address: "",
    pincode: "",
    bloodBankAvailable: false,
    emergencyServices: false,
    description: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.hospitalName) return "Hospital Name is required";
    if (!formData.registrationNumber) return "Registration Number is required";
    if (!formData.phone) return "Contact Number is required";
    if (!formData.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email format";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.city) return "City is required";
    if (!formData.address) return "Address is required";
    if (!formData.pincode) return "Pincode is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const nextStep = () => {
    const error = step === 1 ? validateStep1() : validateStep2();
    if (error) {
      toast.error(error);
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    try {
      setIsLoading(true);

      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "hospital",
            full_name: formData.hospitalName,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Could not retrieve user ID after signup.");

      // 2. Insert hospital profile into 'hospitals' table
      const { error: dbError } = await supabase.from("hospitals").insert([
        {
          id: userId,
          hospital_name: formData.hospitalName,
          registration_number: formData.registrationNumber,
          hospital_type: formData.hospitalType,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          pincode: formData.pincode,
          blood_bank_available: formData.bloodBankAvailable,
          emergency_services: formData.emergencyServices,
          description: formData.description,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("Registration successful!");
      navigate("/hospital-dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-background rounded-2xl shadow-xl border overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-8 px-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-4">
              <Hospital className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Hospital Registration</h1>
            <p className="mt-2 text-emerald-50 max-w-lg text-sm">
              Join our network to manage blood requests, track inventory, and connect with donors in real-time.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-muted -z-10" />
              {[
                { num: 1, label: "Basic Info" },
                { num: 2, label: "Location" },
                { num: 3, label: "Medical & Safety" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      step >= s.num
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-muted text-muted-foreground border-2 border-background"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.num ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Hospital Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Hospital / Clinic Name <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Enter full hospital name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration / License No. <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="License ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hospital Type <span className="text-destructive">*</span></label>
                    <select
                      name="hospitalType"
                      value={formData.hospitalType}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Private">Private Hospital</option>
                      <option value="Government">Government Hospital</option>
                      <option value="Blood Bank">Dedicated Blood Bank</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Number <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="+91"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Official Email <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="contact@hospital.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Location & Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Complete Address <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        placeholder="Street address, building name, area..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">City / District <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pincode <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="6-digit PIN"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2 pt-4 border-t">
                    <label className="text-sm font-medium">Set Password <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Used for login. Minimum 6 characters required.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Medical Info & Documents</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        name="bloodBankAvailable"
                        checked={formData.bloodBankAvailable}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-medium leading-none block">In-house Blood Bank</span>
                        <span className="text-xs text-muted-foreground block">Hospital has a dedicated blood storage facility</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        name="emergencyServices"
                        checked={formData.emergencyServices}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-medium leading-none block">24/7 Emergency Services</span>
                        <span className="text-xs text-muted-foreground block">ER and trauma center available</span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hospital Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder="Brief overview of the hospital, specialties, etc."
                    />
                  </div>

                  {/* Bonus: Document Upload UI placeholder */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">Verification Documents <span className="text-muted-foreground font-normal">(Optional for now)</span></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload License</span>
                        <span className="text-xs text-muted-foreground">PDF, JPEG or PNG</span>
                      </div>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Hospital Logo</span>
                        <span className="text-xs text-muted-foreground">For your profile page</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-muted transition-colors ${
                  step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                Back
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Create Account
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
