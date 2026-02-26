import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Package } from "lucide-react";

const zones = [
  { value: "local", label: "Local (Same City)", rate: 5 },
  { value: "regional", label: "Regional (Same State)", rate: 10 },
  { value: "national", label: "National (Domestic)", rate: 18 },
  { value: "international", label: "International", rate: 35 },
];

export const RateCalculator = () => {
  const [weight, setWeight] = useState("");
  const [zone, setZone] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const z = zones.find((z) => z.value === zone);
    if (!w || !z) return;
    const cost = z.rate + w * 1.5;
    setResult(Math.round(cost * 100) / 100);
  };

  return (
    <Card className="mx-auto max-w-md border-0 shadow-card">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-gradient text-accent-foreground">
          <Calculator className="h-6 w-6" />
        </div>
        <CardTitle className="font-heading text-xl">Estimate Shipping Cost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Package Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="e.g. 2.5"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setResult(null); }}
          />
        </div>
        <div className="space-y-2">
          <Label>Destination Zone</Label>
          <Select value={zone} onValueChange={(v) => { setZone(v); setResult(null); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full bg-accent-gradient text-accent-foreground font-semibold shadow-glow"
          onClick={calculate}
          disabled={!weight || !zone}
        >
          Calculate Rate
        </Button>
        {result !== null && (
          <div className="rounded-lg bg-muted p-4 text-center animate-fade-up">
            <p className="text-sm text-muted-foreground">Estimated Cost</p>
            <p className="font-heading text-3xl font-bold text-foreground">${result.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Final price may vary based on dimensions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
