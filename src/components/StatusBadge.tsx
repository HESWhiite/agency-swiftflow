import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  picked_up: { label: "Picked Up", className: "bg-info text-info-foreground" },
  in_transit: { label: "In Transit", className: "bg-warning text-warning-foreground" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-info text-info-foreground" },
  delivered: { label: "Delivered", className: "bg-success text-success-foreground" },
  returned: { label: "Returned", className: "bg-destructive text-destructive-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive text-destructive-foreground" },
  unpaid: { label: "Unpaid", className: "bg-warning text-warning-foreground" },
  paid: { label: "Paid", className: "bg-success text-success-foreground" },
  overdue: { label: "Overdue", className: "bg-destructive text-destructive-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge className={config.className}>{config.label}</Badge>;
}
