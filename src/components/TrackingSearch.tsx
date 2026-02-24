import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TrackingSearchProps {
  variant?: "hero" | "default";
}

export function TrackingSearch({ variant = "default" }: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?code=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleTrack} className="flex w-full max-w-lg gap-2">
      <Input
        placeholder="Enter tracking number (e.g. SWF-A1B2C3D4)"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        className={isHero
          ? "h-12 rounded-lg border-none bg-card text-foreground placeholder:text-muted-foreground shadow-lg text-base"
          : "h-10"
        }
        maxLength={20}
      />
      <Button
        type="submit"
        className={isHero
          ? "h-12 px-6 bg-accent-gradient text-accent-foreground font-semibold shadow-glow"
          : "h-10"
        }
      >
        <Search className="mr-2 h-4 w-4" />
        Track
      </Button>
    </form>
  );
}
