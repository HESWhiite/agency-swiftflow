import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ShipmentNotificationRequest {
  tracking_number: string;
  sender_name: string;
  sender_email: string | null;
  receiver_name: string;
  receiver_email: string | null;
  receiver_address: string;
  sender_address: string;
  estimated_delivery: string | null;
  package_description: string | null;
  shipping_cost: number | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
    const data: ShipmentNotificationRequest = await req.json();

    const emails: Promise<any>[] = [];

    const trackingUrl = `${req.headers.get("origin") || "https://swiftflow.app"}/track?code=${data.tracking_number}`;

    const emailHtml = (recipientName: string, role: "sender" | "receiver") => `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #1a1a2e; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Swift<span style="color: #f59e0b;">Flow</span></h1>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Fast & Reliable Logistics</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a2e; margin-bottom: 16px;">Shipment Created!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Hello <strong>${recipientName}</strong>,
          </p>
          <p style="color: #475569; line-height: 1.6;">
            ${role === "sender"
              ? "Your shipment has been created and is being processed."
              : "A package is on its way to you!"
            }
          </p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Tracking Number</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1a1a2e; text-align: right; font-family: monospace;">${data.tracking_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">From</td>
                <td style="padding: 8px 0; color: #1a1a2e; text-align: right;">${data.sender_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">To</td>
                <td style="padding: 8px 0; color: #1a1a2e; text-align: right;">${data.receiver_name}</td>
              </tr>
              ${data.estimated_delivery ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Est. Delivery</td>
                <td style="padding: 8px 0; color: #1a1a2e; text-align: right;">${new Date(data.estimated_delivery).toLocaleDateString()}</td>
              </tr>` : ""}
              ${data.package_description ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Package</td>
                <td style="padding: 8px 0; color: #1a1a2e; text-align: right;">${data.package_description}</td>
              </tr>` : ""}
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #1a1a2e; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Track Your Package
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            Thank you for choosing SwiftFlow! — swift, secure, reliable.
          </p>
        </div>
      </div>
    `;

    // Send to sender
    if (data.sender_email) {
      emails.push(
        resend.emails.send({
          from: "SwiftFlow <onboarding@resend.dev>",
          to: [data.sender_email],
          subject: `Shipment Created — ${data.tracking_number}`,
          html: emailHtml(data.sender_name, "sender"),
        })
      );
    }

    // Send to receiver
    if (data.receiver_email) {
      emails.push(
        resend.emails.send({
          from: "SwiftFlow <onboarding@resend.dev>",
          to: [data.receiver_email],
          subject: `Package on the way — ${data.tracking_number}`,
          html: emailHtml(data.receiver_name, "receiver"),
        })
      );
    }

    const results = await Promise.allSettled(emails);
    const failures = results.filter((r) => r.status === "rejected");

    if (failures.length > 0) {
      console.error("Some emails failed:", failures);
    }

    return new Response(
      JSON.stringify({ success: true, sent: emails.length, failed: failures.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
