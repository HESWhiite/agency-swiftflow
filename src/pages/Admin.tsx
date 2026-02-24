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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Users, FileText, Truck, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusLocation, setStatusLocation] = useState("");
  const [statusDescription, setStatusDescription] = useState("");

  const [shipmentForm, setShipmentForm] = useState({
    sender_name: "", sender_email: "", sender_phone: "", sender_address: "",
    receiver_name: "", receiver_email: "", receiver_phone: "", receiver_address: "",
    package_description: "", weight: "", dimensions: "", shipping_cost: "", estimated_delivery: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    shipment_id: "", user_id: "", amount: "", tax: "", due_date: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

  const fetchAll = async () => {
    const [shipRes, usersRes, invRes] = await Promise.all([
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    ]);
    setShipments(shipRes.data || []);
    setUsers(usersRes.data || []);
    setInvoices(invRes.data || []);
  };

  const handleCreateShipment = async () => {
    const { data: trackingNum } = await supabase.rpc("generate_tracking_number");
    if (!trackingNum) { toast.error("Failed to generate tracking number"); return; }

    const { error } = await supabase.from("shipments").insert({
      tracking_number: trackingNum,
      sender_name: shipmentForm.sender_name,
      sender_email: shipmentForm.sender_email || null,
      sender_phone: shipmentForm.sender_phone || null,
      sender_address: shipmentForm.sender_address,
      receiver_name: shipmentForm.receiver_name,
      receiver_email: shipmentForm.receiver_email || null,
      receiver_phone: shipmentForm.receiver_phone || null,
      receiver_address: shipmentForm.receiver_address,
      package_description: shipmentForm.package_description || null,
      weight: shipmentForm.weight ? parseFloat(shipmentForm.weight) : null,
      dimensions: shipmentForm.dimensions || null,
      shipping_cost: shipmentForm.shipping_cost ? parseFloat(shipmentForm.shipping_cost) : 0,
      estimated_delivery: shipmentForm.estimated_delivery || null,
      created_by: user!.id,
    });

    if (error) {
      toast.error("Failed to create shipment: " + error.message);
    } else {
      toast.success(`Shipment created! Tracking: ${trackingNum}`);
      setCreateShipmentOpen(false);
      setShipmentForm({ sender_name: "", sender_email: "", sender_phone: "", sender_address: "", receiver_name: "", receiver_email: "", receiver_phone: "", receiver_address: "", package_description: "", weight: "", dimensions: "", shipping_cost: "", estimated_delivery: "" });
      fetchAll();
    }
  };

  const handleCreateInvoice = async () => {
    const { data: invNum } = await supabase.rpc("generate_invoice_number");
    if (!invNum) { toast.error("Failed to generate invoice number"); return; }

    const amount = parseFloat(invoiceForm.amount) || 0;
    const tax = parseFloat(invoiceForm.tax) || 0;

    const { error } = await supabase.from("invoices").insert({
      invoice_number: invNum,
      shipment_id: invoiceForm.shipment_id || null,
      user_id: invoiceForm.user_id || null,
      amount,
      tax,
      total: amount + tax,
      due_date: invoiceForm.due_date || null,
    });

    if (error) {
      toast.error("Failed to create invoice: " + error.message);
    } else {
      toast.success(`Invoice ${invNum} created`);
      setCreateInvoiceOpen(false);
      setInvoiceForm({ shipment_id: "", user_id: "", amount: "", tax: "", due_date: "" });
      fetchAll();
    }
  };

  const handleUpdateStatus = async (shipmentId: string) => {
    if (!newStatus) return;

    const [updateRes, eventRes] = await Promise.all([
      supabase.from("shipments").update({ status: newStatus }).eq("id", shipmentId),
      supabase.from("tracking_events").insert({
        shipment_id: shipmentId,
        status: newStatus,
        location: statusLocation || null,
        description: statusDescription || null,
      }),
    ]);

    if (updateRes.error || eventRes.error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      setUpdateStatusOpen(null);
      setNewStatus("");
      setStatusLocation("");
      setStatusDescription("");
      fetchAll();
    }
  };

  if (authLoading || !isAdmin) return null;

  const stats = [
    { label: "Total Shipments", value: shipments.length, icon: Truck },
    { label: "Active Shipments", value: shipments.filter((s) => !["delivered", "cancelled", "returned"].includes(s.status)).length, icon: Package },
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Pending Invoices", value: invoices.filter((i) => i.status === "unpaid").length, icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

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
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* SHIPMENTS TAB */}
          <TabsContent value="shipments" className="mt-4">
            <div className="mb-4">
              <Dialog open={createShipmentOpen} onOpenChange={setCreateShipmentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent-gradient text-accent-foreground">
                    <Plus className="mr-2 h-4 w-4" /> Create Shipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create New Shipment</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="space-y-2"><Label>Sender Name *</Label><Input value={shipmentForm.sender_name} onChange={(e) => setShipmentForm({ ...shipmentForm, sender_name: e.target.value })} maxLength={100} /></div>
                    <div className="space-y-2"><Label>Sender Email</Label><Input type="email" value={shipmentForm.sender_email} onChange={(e) => setShipmentForm({ ...shipmentForm, sender_email: e.target.value })} maxLength={255} /></div>
                    <div className="space-y-2"><Label>Sender Phone</Label><Input value={shipmentForm.sender_phone} onChange={(e) => setShipmentForm({ ...shipmentForm, sender_phone: e.target.value })} maxLength={20} /></div>
                    <div className="space-y-2"><Label>Sender Address *</Label><Input value={shipmentForm.sender_address} onChange={(e) => setShipmentForm({ ...shipmentForm, sender_address: e.target.value })} maxLength={300} /></div>
                    <div className="space-y-2"><Label>Receiver Name *</Label><Input value={shipmentForm.receiver_name} onChange={(e) => setShipmentForm({ ...shipmentForm, receiver_name: e.target.value })} maxLength={100} /></div>
                    <div className="space-y-2"><Label>Receiver Email</Label><Input type="email" value={shipmentForm.receiver_email} onChange={(e) => setShipmentForm({ ...shipmentForm, receiver_email: e.target.value })} maxLength={255} /></div>
                    <div className="space-y-2"><Label>Receiver Phone</Label><Input value={shipmentForm.receiver_phone} onChange={(e) => setShipmentForm({ ...shipmentForm, receiver_phone: e.target.value })} maxLength={20} /></div>
                    <div className="space-y-2"><Label>Receiver Address *</Label><Input value={shipmentForm.receiver_address} onChange={(e) => setShipmentForm({ ...shipmentForm, receiver_address: e.target.value })} maxLength={300} /></div>
                    <div className="space-y-2 sm:col-span-2"><Label>Package Description</Label><Textarea value={shipmentForm.package_description} onChange={(e) => setShipmentForm({ ...shipmentForm, package_description: e.target.value })} maxLength={500} /></div>
                    <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={shipmentForm.weight} onChange={(e) => setShipmentForm({ ...shipmentForm, weight: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Dimensions</Label><Input placeholder="LxWxH cm" value={shipmentForm.dimensions} onChange={(e) => setShipmentForm({ ...shipmentForm, dimensions: e.target.value })} maxLength={50} /></div>
                    <div className="space-y-2"><Label>Shipping Cost ($)</Label><Input type="number" value={shipmentForm.shipping_cost} onChange={(e) => setShipmentForm({ ...shipmentForm, shipping_cost: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Est. Delivery Date</Label><Input type="date" value={shipmentForm.estimated_delivery} onChange={(e) => setShipmentForm({ ...shipmentForm, estimated_delivery: e.target.value })} /></div>
                  </div>
                  <Button onClick={handleCreateShipment} className="mt-4 bg-accent-gradient text-accent-foreground w-full" disabled={!shipmentForm.sender_name || !shipmentForm.sender_address || !shipmentForm.receiver_name || !shipmentForm.receiver_address}>
                    Create Shipment
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm font-medium">{s.tracking_number}</TableCell>
                        <TableCell>{s.sender_name}</TableCell>
                        <TableCell>{s.receiver_name}</TableCell>
                        <TableCell><StatusBadge status={s.status} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Dialog open={updateStatusOpen === s.id} onOpenChange={(open) => { setUpdateStatusOpen(open ? s.id : null); if (!open) { setNewStatus(""); setStatusLocation(""); setStatusDescription(""); } }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Update Status</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-heading">Update Status — {s.tracking_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label>New Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                      {["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"].map((st) => (
                                        <SelectItem key={st} value={st}>{st.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2"><Label>Location</Label><Input value={statusLocation} onChange={(e) => setStatusLocation(e.target.value)} placeholder="e.g. New York Hub" maxLength={200} /></div>
                                <div className="space-y-2"><Label>Description</Label><Input value={statusDescription} onChange={(e) => setStatusDescription(e.target.value)} placeholder="e.g. Package arrived at sorting facility" maxLength={500} /></div>
                                <Button onClick={() => handleUpdateStatus(s.id)} className="w-full bg-accent-gradient text-accent-foreground" disabled={!newStatus}>Update</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="mt-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                        <TableCell>{u.email || "—"}</TableCell>
                        <TableCell>{u.phone || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVOICES TAB */}
          <TabsContent value="invoices" className="mt-4">
            <div className="mb-4">
              <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent-gradient text-accent-foreground">
                    <Plus className="mr-2 h-4 w-4" /> Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Shipment</Label>
                      <Select value={invoiceForm.shipment_id} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, shipment_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select shipment (optional)" /></SelectTrigger>
                        <SelectContent>
                          {shipments.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.tracking_number} — {s.receiver_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Customer</Label>
                      <Select value={invoiceForm.user_id} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, user_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || u.email || u.user_id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Amount ($) *</Label><Input type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Tax ($)</Label><Input type="number" value={invoiceForm.tax} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} /></div>
                    <Button onClick={handleCreateInvoice} className="w-full bg-accent-gradient text-accent-foreground" disabled={!invoiceForm.amount}>Create Invoice</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                        <TableCell>${inv.amount?.toFixed(2)}</TableCell>
                        <TableCell>${inv.tax?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="font-medium">${inv.total?.toFixed(2)}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
