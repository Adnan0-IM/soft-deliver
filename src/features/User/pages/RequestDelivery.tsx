import React, { useState } from "react";
import { useNavigate } from "react-router";

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

const mockPlaceDeliveryOrder = async () => {
  await new Promise((r) => setTimeout(r, 600));
  return { orderId: `order_${Date.now()}` };
};

const RequestDelivery: React.FC = () => {
  const navigate = useNavigate();

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
      const res = await mockPlaceDeliveryOrder();
      navigate(`/user/track/${res.orderId}`);
    } catch {
      setError("Failed to place delivery order.");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Request a Delivery</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Pickup address
          <input
            type="text"
            placeholder="e.g., 123 Main St"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Drop-off address
          <input
            type="text"
            placeholder="e.g., 456 Market Ave"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Package type
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value as PackageType)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label>
          Weight (kg, optional)
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 2.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Receiver name
          <input
            type="text"
            placeholder="e.g., Jane Doe"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Receiver phone
          <input
            type="tel"
            placeholder="e.g., +123456789"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleEstimate}
            disabled={loadingEstimate || !canEstimate}
          >
            {loadingEstimate ? "Calculating..." : "Calculate Cost"}
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={loadingOrder || !estimate}
            style={{ background: "#2563eb", color: "white" }}
          >
            {loadingOrder ? "Placing..." : "Place Delivery Order"}
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {estimate && (
          <div style={{ padding: 8, background: "#f3f4f6", borderRadius: 6 }}>
            <div>Estimated Price: ${estimate.price}</div>
            <div>ETA: {estimate.etaMinutes} min</div>
          </div>
        )}

        {/* Map Integration (optional). Reuse the same map placeholder or component as in RequestRide */}
        <div>
          <div>Map (optional)</div>
          <div
            style={{ height: 300, background: "#e5e7eb", borderRadius: 8 }}
            aria-label="Map placeholder"
          />
        </div>
      </div>
    </div>
  );
};

export default RequestDelivery;
