import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingSearch } from "@/components/TrackingSearch";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Package } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

interface Shipment {
  tracking_number: string;
  status: string;
  sender_name: string;
  receiver_name: string;
  receiver_address: string;
  package_description: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

const Track = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (code) fetchTracking(code);
  }, [code]);

  const fetchTracking = async (trackingNumber: string) => {
    setLoading(true);
    setNotFound(false);

    const { data: shipData, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", trackingNumber.trim())
      .maybeSingle();

    if (error || !shipData) {
      setNotFound(true);
      setShipment(null);
      setEvents([]);
      setLoading(false);
      return;
    }

    setShipment(shipData);

    const { data: eventsData } = await supabase
      .from("tracking_events")
      .select("*")
      .eq("shipment_id", shipData.id)
      .order("created_at", { ascending: false });

    setEvents(eventsData || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl font-bold mb-2">Track Your Package</h1>
          <p className="text-muted-foreground mb-6">Enter your tracking number to see real-time updates</p>
          <TrackingSearch />

          {loading && <p className="mt-8 text-muted-foreground">Searching...</p>}

          {notFound && code && (
            <Card className="mt-8 border-destructive/20">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-heading font-semibold text-lg">Package Not Found</h3>
                <p className="text-muted-foreground text-sm mt-1">No shipment found for tracking number "{code}"</p>
              </CardContent>
            </Card>
          )}

          {shipment && (
            <div className="mt-8 space-y-6 animate-fade-up">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-xl">{shipment.tracking_number}</CardTitle>
                    <StatusBadge status={shipment.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">From:</span>
                      <p className="font-medium">{shipment.sender_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To:</span>
                      <p className="font-medium">{shipment.receiver_name}</p>
                      <p className="text-muted-foreground">{shipment.receiver_address}</p>
                    </div>
                  </div>
                  {shipment.package_description && (
                    <div>
                      <span className="text-muted-foreground">Package:</span>
                      <p>{shipment.package_description}</p>
                    </div>
                  )}
                  {shipment.estimated_delivery && (
                    <div>
                      <span className="text-muted-foreground">Est. Delivery:</span>
                      <p className="font-medium">{new Date(shipment.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {events.length > 0 && (
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">Tracking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events.map((event, i) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-secondary" : "bg-muted-foreground/30"}`} />
                            {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-sm">{event.description || event.status}</p>
                            {event.location && (
                              <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {event.location}
                              </p>
                            )}
                            <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Track;
