import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, FileText, User, Truck } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", address: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [shipRes, invRes, profRes] = await Promise.all([
      supabase.from("shipments").select("*").eq("sender_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setShipments(shipRes.data || []);
    setInvoices(invRes.data || []);
    if (profRes.data) {
      setProfile(profRes.data);
      setProfileForm({
        full_name: profRes.data.full_name || "",
        phone: profRes.data.phone || "",
        address: profRes.data.address || "",
      });
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(profileForm)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setEditingProfile(false);
      fetchData();
    }
  };

  if (authLoading) return null;

  const stats = [
    { label: "Total Shipments", value: shipments.length, icon: Truck },
    { label: "In Transit", value: shipments.filter((s) => s.status === "in_transit").length, icon: Package },
    { label: "Delivered", value: shipments.filter((s) => s.status === "delivered").length, icon: Package },
    { label: "Invoices", value: invoices.length, icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">My Dashboard</h1>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {stats.map((s, i) => (
            <Card key={i} className="shadow-card border-0">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent-gradient text-accent-foreground flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="shipments">
          <TabsList>
            <TabsTrigger value="shipments">My Shipments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="mt-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                {shipments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No shipments yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking #</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.map((s) => (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/track?code=${s.tracking_number}`)}>
                          <TableCell className="font-mono text-sm font-medium">{s.tracking_number}</TableCell>
                          <TableCell>{s.receiver_name}</TableCell>
                          <TableCell><StatusBadge status={s.status} /></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No invoices yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                          <TableCell>${inv.total?.toFixed(2)}</TableCell>
                          <TableCell><StatusBadge status={inv.status} /></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card className="shadow-card border-0 max-w-lg">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <User className="h-5 w-5" /> My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    disabled={!editingProfile}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!editingProfile}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!editingProfile}
                    maxLength={300}
                  />
                </div>
                {editingProfile ? (
                  <div className="flex gap-2">
                    <Button onClick={handleProfileSave} className="bg-accent-gradient text-accent-foreground">Save</Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
