import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingSearch } from "@/components/TrackingSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Shield, Clock, MapPin, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Truck, title: "Express Delivery", description: "Same-day and next-day delivery options for urgent shipments." },
  { icon: MapPin, title: "Real-Time Tracking", description: "Track your packages in real-time with detailed status updates." },
  { icon: Shield, title: "Secure Handling", description: "Your packages are handled with care and fully insured." },
  { icon: Clock, title: "On-Time Guarantee", description: "We guarantee delivery within the estimated timeframe." },
  { icon: BarChart3, title: "Dashboard Analytics", description: "Get insights into your shipping history and spending." },
  { icon: Package, title: "Custom Solutions", description: "Tailored logistics solutions for businesses of all sizes." },
];

const steps = [
  { step: "01", title: "Create Account", description: "Sign up in seconds and access your personal dashboard." },
  { step: "02", title: "Ship Your Package", description: "Request a pickup or drop off at any of our locations." },
  { step: "03", title: "Track & Receive", description: "Monitor your shipment in real-time until delivery." },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-up font-heading text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Deliver with{" "}
              <span className="text-gradient">Speed & Confidence</span>
            </h1>
            <p className="mt-6 animate-fade-up text-lg text-primary-foreground/70 md:text-xl" style={{ animationDelay: "0.1s" }}>
              SwiftFlow provides fast, reliable, and secure logistics solutions. Track your packages in real-time and manage shipments effortlessly.
            </p>
            <div className="mt-8 flex animate-fade-up flex-col items-center gap-4" style={{ animationDelay: "0.2s" }}>
              <TrackingSearch variant="hero" />
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="bg-accent-gradient text-accent-foreground font-semibold shadow-glow"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate("/track")}
                >
                  Track Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Why Choose SwiftFlow?</h2>
          <p className="mt-3 text-muted-foreground text-lg">Everything you need for seamless logistics management</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card key={i} className="group shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border-0">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-gradient text-accent-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient text-accent-foreground font-heading text-2xl font-bold shadow-glow">
                  {s.step}
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero py-20">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Ship?
          </h2>
          <p className="mt-4 text-primary-foreground/70 text-lg max-w-xl mx-auto">
            Join thousands of businesses and individuals who trust SwiftFlow for their delivery needs.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-accent-gradient text-accent-foreground font-semibold shadow-glow"
            onClick={() => navigate("/signup")}
          >
            Create Free Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
