import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This page is the core feature. Start simple.

type RideType = "bike" | "car";

const mockEstimate = async (
  pickup: string,
  destination: string,
  type: RideType,
) => {
  await new Promise((r) => setTimeout(r, 500));
  // Fake pricing: base + distance approximation by string length
  const base = type === "bike" ? 2.5 : 5.0;
  const distanceFactor = (pickup.length + destination.length) * 0.05;
  return {
    price: +(base + distanceFactor).toFixed(2),
    etaMinutes: type === "bike" ? 5 : 8,
  };
};

const mockRequestRide = async (
  pickup: string,
  destination: string,
  type: RideType,
) => {
  await new Promise((r) => setTimeout(r, 600));
  // Return a fake rideId
  console.log(pickup);
  console.log(destination);

  console.log(type);
  return { rideId: `ride_${Date.now()}` };
};
const RideRequest = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState<RideType>("bike");
  const [estimate, setEstimate] = useState<{
    price: number;
    etaMinutes: number;
  } | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  // Placeholder Map: attach Leaflet later
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // You can initialize Leaflet here:
    // const L = await import('leaflet');
    // const map = L.map(mapRef.current!).setView([lat, lng], 13);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }, []);

  const canEstimate = pickup.trim().length > 2 && destination.trim().length > 2;

  const handleEstimate = async () => {
    setError(null);
    setEstimate(null);
    if (!canEstimate) {
      setError("Please enter valid pickup and destination.");
      return;
    }
    try {
      setLoadingEstimate(true);
      const res = await mockEstimate(pickup, destination, rideType);
      setEstimate(res);
    } catch (e) {
      setError("Failed to get estimate.");
      console.log(e);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    if (!estimate) {
      setError("Get an estimate before confirming.");
      return;
    }
    try {
      setLoadingRequest(true);
      const res = await mockRequestRide(pickup, destination, rideType);
      navigate(`/user/track/${res.rideId}`);
    } catch (e) {
      setError("Failed to create ride request.");
      console.log(e);
    } finally {
      setLoadingRequest(false);
    }
  };
  return (
    <Card>
      <CardContent className="p-4 grid gap-3">
        <div>
          <Label className="mb-1 block">Pickup location</Label>
          <Input
            placeholder="e.g., 123 Main St"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Destination</Label>
          <Input
            placeholder="e.g., Airport Terminal 1"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Ride type</Label>
          <Select
            value={rideType}
            onValueChange={(v) => setRideType(v as RideType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="car">Car</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEstimate}
            disabled={loadingEstimate || !canEstimate}
          >
            {loadingEstimate ? "Getting estimate..." : "Get Estimate"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loadingRequest || !estimate}
          >
            {loadingRequest ? "Requesting..." : "Confirm Request"}
          </Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {estimate && (
          <div className="p-3 rounded-md bg-muted">
            <div>Estimated Price: ₦{estimate.price}</div>
            <div>ETA: {estimate.etaMinutes} min</div>
          </div>
        )}
        <div>
          <div className="text-sm mb-1">Map</div>
          <div
            ref={mapRef}
            className="h-[300px] bg-muted rounded-md"
            aria-label="Map placeholder"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RideRequest;
