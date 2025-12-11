import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type PackageType = "small" | "medium" | "large";

const mockDeliveryEstimate = async (
  pickup: string,
  dropoff: string,
  pkg: PackageType,
  weightKg?: number
) => {
  await new Promise((r) => setTimeout(r, 500));
  const base = pkg === "small" ? 4 : pkg === "medium" ? 6.5 : 9;
  const distanceFactor = (pickup.length + dropoff.length) * 0.04;
  const weightFactor = weightKg ? Math.min(weightKg, 20) * 0.15 : 0;
  return {
    price: +(base + distanceFactor + weightFactor).toFixed(2),
    etaMinutes: 20,
  };
};

const RequestDelivery = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [packageType, setPackageType] = useState<PackageType>("small");
  const [weight, setWeight] = useState<string>(""); // keep as string for input control
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  const [estimate, setEstimate] = useState<{
    price: number;
    etaMinutes: number;
  } | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEstimate =
    pickup.trim().length > 2 &&
    dropoff.trim().length > 2 &&
    receiverName.trim().length > 1 &&
    receiverPhone.trim().length >= 7;

  const handleEstimate = async () => {
    setError(null);
    setEstimate(null);
    if (!canEstimate) {
      setError("Please fill pickup, drop-off, receiver name and phone.");
      return;
    }
    try {
      setLoadingEstimate(true);
      const w = weight.trim() ? Number(weight) : undefined;
      if (w !== undefined && Number.isNaN(w)) {
        setError("Weight must be a number.");
        return;
      }
      const res = await mockDeliveryEstimate(pickup, dropoff, packageType, w);
      setEstimate(res);
    } catch {
      setError("Failed to calculate cost.");
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);
    if (!estimate) {
      setError("Calculate cost before placing the order.");
      return;
    }
    try {
      setLoadingOrder(true);
    } catch {
      setError("Failed to place delivery order.");
    } finally {
      setLoadingOrder(false);
    }
  };
  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-4">Request a Delivery</h2>
      <Card>
        <CardContent className="p-4 grid gap-3">
          <div>
            <Label className="mb-1 block">Pickup address</Label>
            <Input
              placeholder="e.g., 123 Main St"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Drop-off address</Label>
            <Input
              placeholder="e.g., 456 Market Ave"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Package type</Label>
            <Select
              value={packageType}
              onValueChange={(v) => setPackageType(v as PackageType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Weight (kg, optional)</Label>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder="e.g., 2.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Receiver name</Label>
            <Input
              placeholder="e.g., Jane Doe"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Receiver phone</Label>
            <Input
              type="tel"
              placeholder="e.g., +123456789"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleEstimate}
              disabled={loadingEstimate || !canEstimate}
            >
              {loadingEstimate ? "Calculating..." : "Calculate Cost"}
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={loadingOrder || !estimate}
            >
              {loadingOrder ? "Placing..." : "Place Delivery Order"}
            </Button>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          {estimate && (
            <div className="p-3 rounded-md bg-muted">
              <div>Estimated Price: ${estimate.price}</div>
              <div>ETA: {estimate.etaMinutes} min</div>
            </div>
          )}
          <div>
            <div className="text-sm mb-1">Map (optional)</div>
            <div
              className="h-[300px] bg-muted rounded-md"
              aria-label="Map placeholder"
            />
          </div>
        </CardContent>
      </Card>
      <div>Map (optional)</div>
      <div
        style={{ height: 300, background: "#e5e7eb", borderRadius: 8 }}
        aria-label="Map placeholder"
      />
    </div>
  );
};

export default RequestDelivery;
