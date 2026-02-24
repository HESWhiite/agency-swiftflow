import { Package } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-heading text-xl font-bold mb-4">
              <Package className="h-6 w-6 text-secondary" />
              SwiftFlow
            </div>
            <p className="text-sm opacity-70">
              Fast, reliable delivery and logistics solutions for businesses and individuals worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/" className="hover:opacity-100 transition-opacity">Home</Link>
              <Link to="/track" className="hover:opacity-100 transition-opacity">Track Package</Link>
              <Link to="/login" className="hover:opacity-100 transition-opacity">Sign In</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Services</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <span>Express Delivery</span>
              <span>Freight Shipping</span>
              <span>Warehousing</span>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <span>support@swiftflow.com</span>
              <span>+1 (555) 123-4567</span>
              <span>123 Logistics Ave, NYC</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-sm opacity-50">
          © {new Date().getFullYear()} SwiftFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
