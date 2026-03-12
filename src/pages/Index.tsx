import { Link } from "react-router-dom";
import { Search, Droplets, MapPin, Heart, Users, Shield, ArrowRight, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { BLOOD_GROUPS } from "@/lib/donors";
import { SAMPLE_DONORS } from "@/lib/sample-data";
import { getEligibilityStatus } from "@/lib/eligibility";
import StatsCard from "@/components/StatsCard";

const Index = () => {
  const totalDonors = SAMPLE_DONORS.length;
  const availableDonors = SAMPLE_DONORS.filter((d) => d.available).length;
  const eligibleDonors = SAMPLE_DONORS.filter((d) => getEligibilityStatus(d) === "eligible").length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center animate-fade-in">
              <img src="/logo.png" onError={(e) => (e.currentTarget.src = logo)} alt="NIRAMAYA" className="h-44 w-44 object-contain animate-heartbeat" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-brand animate-fade-in stagger-1">
              <span className="text-primary">NIRA</span>
              <span className="text-secondary">MAYA</span>
            </h1>
            <p className="mt-1 text-xl font-semibold animate-fade-in stagger-2">
              <span className="text-primary">निरोग</span>{" "}
              <span className="text-secondary">निर्भय</span>{" "}
              <span className="text-primary">निश्चिंत</span>
            </p>
            <p className="mt-2 text-lg font-medium text-muted-foreground animate-fade-in stagger-3">
              Emergency Blood Donor Finder
            </p>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto animate-fade-in stagger-4">
              Find nearby eligible blood donors in seconds. Smart matching with medical eligibility checks — every drop counts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up stagger-4">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200"
              >
                <Search className="h-4 w-4" /> Find a Donor
              </Link>
              <Link
                to="/register-donor"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-accent hover:scale-105 transition-all duration-200"
              >
                <Droplets className="h-4 w-4" /> Become a Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-16 md:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          Three simple steps to find or become a lifesaving donor
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            { icon: Users, title: "Register", desc: "Sign up and register as a blood donor with medical details." },
            { icon: Search, title: "Search", desc: "Search for available donors by blood group, location, and eligibility." },
            { icon: Phone, title: "Connect", desc: "Call the best-matched donor directly and save a life." },
          ].map((step, i) => (
            <div key={i} className={`flex flex-col items-center text-center animate-fade-in-up stagger-${i + 1}`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary hover:scale-110 hover:bg-primary/20 transition-all duration-300">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Platform Statistics</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatsCard title="Total Donors" value={totalDonors} icon={Users} />
            <StatsCard title="Available Now" value={availableDonors} icon={Heart} />
            <StatsCard title="Eligible Donors" value={eligibleDonors} icon={Shield} />
          </div>
          <div className="mt-6 text-center">
            <Link to="/stats" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View full statistics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">About NIRAMAYA</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            NIRAMAYA is a geolocation-based emergency blood donor discovery platform with intelligent medical eligibility verification.
            Our smart matching algorithm considers donor health, availability, distance, and donation history to connect you with the best donors.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, label: "Location-Based Matching" },
              { icon: Shield, label: "Medical Eligibility Check" },
              { icon: Heart, label: "Saving Lives Daily" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <f.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
