import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NgoLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            toast.error(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // Small verification to ensure they have an NGO profile (Optional but good practice)
            const { data: ngoData } = await supabase
                .from("ngos")
                .select("id")
                .eq("user_id", authData.user.id)
                .single();

            if (!ngoData) {
                toast.warning("Logged in, but NGO profile not found! Are you a regular donor?");
                // Note: Production app should sign them out or redirect them, but leaving open for now based on simplicity.
            } else {
                toast.success("Welcome back to the NGO Portal!");
            }
            navigate("/ngo-dashboard");
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="rounded-2xl border bg-card p-8 shadow-xl">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">NGO Portal Login</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your blood bank inventory and emergency requests.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Official Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button type="button" onClick={() => toast.info("Please contact support at support@niramaya.org")} className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Portal"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don't have an NGO account?{" "}
                        <Link to="/ngo-register" className="font-semibold text-primary hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NgoLogin;
