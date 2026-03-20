import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Building2, MapPin, User, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

const NgoRegister = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        ngo_name: "",
        registration_number: "",
        contact_person: "",
        phone: "",
        email: "",
        password: "",
        city: "",
        address: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.ngo_name || !form.registration_number || !form.contact_person || !form.phone || !form.email || !form.password || !form.city || !form.address) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);

        // 1. Sign up the NGO user in Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (authError) {
            toast.error(authError.message);
            setSubmitting(false);
            return;
        }

        if (!authData.user) {
            toast.error("An unknown error occurred creating the account.");
            setSubmitting(false);
            return;
        }

        // 2. Insert NGO profile
        const { error: dbError } = await supabase.from("ngos").insert({
            user_id: authData.user.id,
            ngo_name: form.ngo_name,
            registration_number: form.registration_number,
            contact_person: form.contact_person,
            phone: form.phone,
            email: form.email,
            city: form.city,
            address: form.address,
        });

        setSubmitting(false);

        if (dbError) {
            toast.error(dbError.message);
            return;
        }

        toast.success("NGO Registration successful! Welcome to the network.");
        navigate("/ngo-dashboard");
    };

    const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-bold animate-fade-in flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" /> Register NGO / Blood Bank
                </h1>
                <p className="mt-1 text-muted-foreground animate-fade-in stagger-1">Join the NIRAMAYA network to manage inventory and respond to emergencies.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                    {/* Organization Details */}
                    <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-1">
                        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
                            <Building2 className="h-4 w-4" /> Organization Details
                        </legend>
                        <div className="mt-3 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">NGO / Blood Bank Name *</label>
                                <input type="text" value={form.ngo_name} onChange={(e) => setForm({ ...form, ngo_name: e.target.value })} className={inputClass} placeholder="Enter official name" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Government Registration Number *</label>
                                <input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className={inputClass} placeholder="e.g. NGO-123456" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Contact Person */}
                    <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-2">
                        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
                            <User className="h-4 w-4" /> Contact & Login
                        </legend>
                        <div className="mt-3 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Contact Person Name *</label>
                                <input type="text" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className={inputClass} placeholder="Full Name" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 9876543210"
                                        inputMode="tel"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Official Email (Login ID) *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={inputClass}
                                        placeholder="ngo@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Password *</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={inputClass}
                                    placeholder="Enter a secure password"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Location */}
                    <fieldset className="rounded-lg border bg-card p-5 shadow-sm animate-fade-in-up stagger-3">
                        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
                            <MapPin className="h-4 w-4" /> Location
                        </legend>
                        <div className="mt-3 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">City *</label>
                                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="City" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Full Address *</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className={`${inputClass} min-h-[80px]`}
                                    placeholder="Complete street address"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <button disabled={submitting} type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Register Organization
                    </button>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Already registered? <Link to="/ngo-login" className="text-primary hover:underline font-medium">Login to NGO Portal</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default NgoRegister;
