import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Package className="h-7 w-7 text-secondary" />
          SwiftFlow
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Track</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
              <Button size="sm" className="bg-accent-gradient text-accent-foreground" onClick={() => navigate("/signup")}>Get Started</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/track" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Track</Link>
            {user && <Link to="/dashboard" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
            {isAdmin && <Link to="/admin" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Admin</Link>}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</Button>
                <Button size="sm" className="bg-accent-gradient text-accent-foreground" onClick={() => { navigate("/signup"); setMobileOpen(false); }}>Get Started</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
