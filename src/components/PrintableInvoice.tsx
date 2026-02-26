import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";

interface InvoiceData {
  invoice_number: string;
  amount: number;
  tax: number | null;
  total: number;
  status: string;
  due_date: string | null;
  created_at: string;
  paid_at: string | null;
  shipment?: {
    tracking_number: string;
    sender_name: string;
    sender_address: string;
    receiver_name: string;
    receiver_address: string;
    package_description: string | null;
    weight: number | null;
    shipping_cost: number | null;
  } | null;
  customer?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
}

export const PrintableInvoice = ({ invoice, trigger }: { invoice: InvoiceData; trigger?: React.ReactNode }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; padding: 40px; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; }
          .brand { font-size: 28px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
          .brand span { color: #f59e0b; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 24px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
          .invoice-title p { color: #64748b; margin-top: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .meta-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
          .meta-block p { font-size: 14px; line-height: 1.6; }
          .table-wrapper { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          thead th { background: #1a1a2e; color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          tbody td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 280px; }
          .totals-table .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .totals-table .row.total { border-top: 2px solid #1a1a2e; font-weight: 700; font-size: 18px; padding-top: 12px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-paid { background: #dcfce7; color: #166534; }
          .status-unpaid { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> View Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center justify-between">
            Invoice {invoice.invoice_number}
            <Button size="sm" onClick={handlePrint} className="bg-accent-gradient text-accent-foreground">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          <div className="invoice-container">
            {/* Header */}
            <div className="header">
              <div>
                <div className="brand">Swift<span>Flow</span></div>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>Fast & Reliable Logistics</p>
              </div>
              <div className="invoice-title">
                <h2>Invoice</h2>
                <p><strong>{invoice.invoice_number}</strong></p>
                <p>Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
                {invoice.due_date && <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>}
                <p style={{ marginTop: "8px" }}>
                  <span className={`status-badge ${invoice.status === "paid" ? "status-paid" : "status-unpaid"}`}>
                    {invoice.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Customer & Shipment Info */}
            <div className="meta">
              <div className="meta-block">
                <h4>Bill To</h4>
                {invoice.customer ? (
                  <>
                    <p><strong>{invoice.customer.full_name || "—"}</strong></p>
                    <p>{invoice.customer.email || ""}</p>
                    <p>{invoice.customer.phone || ""}</p>
                    <p>{invoice.customer.address || ""}</p>
                  </>
                ) : (
                  <p>—</p>
                )}
              </div>
              {invoice.shipment && (
                <div className="meta-block">
                  <h4>Shipment Details</h4>
                  <p><strong>Tracking:</strong> {invoice.shipment.tracking_number}</p>
                  <p><strong>From:</strong> {invoice.shipment.sender_name}</p>
                  <p><strong>To:</strong> {invoice.shipment.receiver_name}</p>
                  {invoice.shipment.weight && <p><strong>Weight:</strong> {invoice.shipment.weight} kg</p>}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {invoice.shipment
                        ? `Shipping Service — ${invoice.shipment.sender_address} → ${invoice.shipment.receiver_address}`
                        : "Shipping Service"}
                      {invoice.shipment?.package_description && (
                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                          Package: {invoice.shipment.package_description}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>${invoice.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="totals">
              <div className="totals-table">
                <div className="row"><span>Subtotal</span><span>${invoice.amount.toFixed(2)}</span></div>
                <div className="row"><span>Tax</span><span>${(invoice.tax || 0).toFixed(2)}</span></div>
                <div className="row total"><span>Total</span><span>${invoice.total.toFixed(2)}</span></div>
              </div>
            </div>

            {invoice.paid_at && (
              <p style={{ marginTop: "20px", color: "#166534", fontSize: "13px" }}>
                <strong>Paid on:</strong> {new Date(invoice.paid_at).toLocaleDateString()}
              </p>
            )}

            {/* Footer */}
            <div className="footer">
              <p>Thank you for choosing SwiftFlow! — swift, secure, reliable.</p>
              <p style={{ marginTop: "4px" }}>For questions, contact support@swiftflow.com</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
