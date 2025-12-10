import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

// This page is the core feature. Start simple.

type RideType = "bike" | "car";

const mockEstimate = async (
  pickup: string,
  destination: string,
  type: RideType
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
  type: RideType
) => {
  await new Promise((r) => setTimeout(r, 600));
  // Return a fake rideId
  console.log(pickup)
  console.log(destination)

  console.log(type)
  return { rideId: `ride_${Date.now()}` };
};

const RequestRide: React.FC = () => {
  const navigate = useNavigate();
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
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h2>Request a Ride</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Pickup location
          <input
            type="text"
            placeholder="e.g., 123 Main St"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Destination
          <input
            type="text"
            placeholder="e.g., Airport Terminal 1"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Ride type
          <select
            value={rideType}
            onChange={(e) => setRideType(e.target.value as RideType)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="bike">Bike</option>
            <option value="car">Car</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleEstimate}
            disabled={loadingEstimate || !canEstimate}
          >
            {loadingEstimate ? "Getting estimate..." : "Get Estimate"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loadingRequest || !estimate}
            style={{ background: "#2563eb", color: "white" }}
          >
            {loadingRequest ? "Requesting..." : "Confirm Request"}
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {estimate && (
          <div style={{ padding: 8, background: "#f3f4f6", borderRadius: 6 }}>
            <div>Estimated Price: ${estimate.price}</div>
            <div>ETA: {estimate.etaMinutes} min</div>
          </div>
        )}

        <div>
          <div>Map</div>
          <div
            ref={mapRef}
            style={{ height: 300, background: "#e5e7eb", borderRadius: 8 }}
            aria-label="Map placeholder"
          />
        </div>
      </div>
    </div>
  );
};

export default RequestRide;
