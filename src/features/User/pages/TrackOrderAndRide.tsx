import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";

type TrackStatus =
  | "searching"
  | "accepted"
  | "arriving"
  | "in_transit"
  | "completed";

type LatLng = { lat: number; lng: number };

const statusSequence: TrackStatus[] = [
  "searching",
  "accepted",
  "arriving",
  "in_transit",
  "completed",
];

const initialUserLocation: LatLng = { lat: 37.773972, lng: -122.431297 }; // Sample
const initialDriverLocation: LatLng = { lat: 37.768, lng: -122.44 };

const TrackOrderAndRide: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [statusIndex, setStatusIndex] = useState(0);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(
    initialDriverLocation
  );
  const [userLocation] = useState<LatLng>(initialUserLocation);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [driverInfo, setDriverInfo] = useState<{
    name: string;
    vehicle: string;
    phone?: string;
  } | null>(null);
  const [rating, setRating] = useState<number>(0);

  // Map
  const mapRef = useRef<HTMLDivElement | null>(null);

  const currentStatus = statusSequence[statusIndex];

  // Realtime mock: progress status + move driver
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;

      // Progress status
      if (tick % 5 === 0 && statusIndex < statusSequence.length - 1) {
        setStatusIndex((s) => s + 1);
      }

      // Move driver toward user
      setDriverLocation((loc) => {
        if (!loc || currentStatus === "completed") return loc;
        const step = 0.0009;
        const dx = userLocation.lat - loc.lat;
        const dy = userLocation.lng - loc.lng;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return {
          lat: loc.lat + (dx / dist) * step,
          lng: loc.lng + (dy / dist) * step,
        };
      });

      // Update trip info (mock)
      setDistanceKm(currentStatus === "in_transit" ? 3.2 : 1.1);
      setEtaMin(currentStatus === "in_transit" ? 6 : 3);
      setPrice(8.75);

      // Set driver info when accepted
      if (currentStatus === "accepted" && !driverInfo) {
        setDriverInfo({
          name: "Alex R.",
          vehicle: "Blue Toyota Corolla",
          phone: "+1 555-0100",
        });
      }
    }, 800);

    return () => clearInterval(interval);
  }, [
    currentStatus,
    driverInfo,
    statusIndex,
    userLocation.lat,
    userLocation.lng,
  ]);

  // Leaflet-ready placeholder
  useEffect(() => {
    // To enable Leaflet:
    // 1) npm install leaflet
    // 2) import 'leaflet/dist/leaflet.css';
    // 3) Initialize map:
    // const L = await import('leaflet');
    // const map = L.map(mapRef.current!).setView([userLocation.lat, userLocation.lng], 13);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
    // const userMarker = L.marker([userLocation.lat, userLocation.lng]).addTo(map);
    // let driverMarker = L.marker([driverLocation!.lat, driverLocation!.lng]).addTo(map);
    // const route = L.polyline([[userLocation.lat, userLocation.lng], [driverLocation!.lat, driverLocation!.lng]], { color: 'blue' }).addTo(map);
    // // Update driver marker/route whenever driverLocation changes (use another effect watching driverLocation).
  }, []);

  // WebSocket / Polling placeholders
  // useEffect(() => {
  //   const ws = new WebSocket(`wss://api.example.com/track/${id}`);
  //   ws.onmessage = (ev) => {
  //     const msg = JSON.parse(ev.data);
  //     // msg: { status, driverLat, driverLng, distanceKm, etaMin, price, driverInfo }
  //     // setStatusIndex(statusSequence.indexOf(msg.status));
  //     // setDriverLocation({ lat: msg.driverLat, lng: msg.driverLng });
  //   };
  //   return () => ws.close();
  // }, [id]);

  const handleEndAndRate = () => {
    // TODO: send rating to backend
    navigate("/user");
  };

  const StatusBox: React.FC = () => {
    const label =
      currentStatus === "searching"
        ? "Searching for driver"
        : currentStatus === "accepted"
        ? "Driver accepted"
        : currentStatus === "arriving"
        ? "Driver coming"
        : currentStatus === "in_transit"
        ? "In transit"
        : "Completed";
    return (
      <div
        style={{
          padding: 10,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Status: {currentStatus.replace("_", " ")}
        </div>
      </div>
    );
  };

  const StatusProgress: React.FC = () => (
    <div
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
    >
      {statusSequence.map((s, i) => (
        <div
          key={s}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: i === statusIndex ? "#dbeafe" : "#f3f4f6",
            fontSize: 13,
          }}
        >
          {s.replace("_", " ")}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Tracking {id}</h2>

      <StatusBox />
      <StatusProgress />

      {/* Live map */}
      <div>
        <div style={{ marginBottom: 6 }}>Live Map</div>
        <div
          ref={mapRef}
          style={{ height: 360, background: "#e5e7eb", borderRadius: 8 }}
          aria-label="Map placeholder"
        />
        {/* Driver/User coordinates */}
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          Driver:{" "}
          {driverLocation
            ? `${driverLocation.lat.toFixed(5)}, ${driverLocation.lng.toFixed(
                5
              )}`
            : "—"}{" "}
          | User:{" "}
          {`${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`}
        </div>
      </div>

      {/* Driver info card */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Driver</div>
        {driverInfo ? (
          <div>
            <div>{driverInfo.name}</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              {driverInfo.vehicle}
            </div>
            {driverInfo.phone && (
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {driverInfo.phone}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>Searching for driver…</div>
        )}
      </div>

      {/* Ride/delivery info */}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Trip</div>
        <div>Distance: {distanceKm ?? "—"} km</div>
        <div>ETA: {etaMin ?? "—"} min</div>
        <div>Cost: {price !== null ? `$${price}` : "—"}</div>
      </div>

      {/* Completion + rating */}
      {currentStatus === "completed" && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Rate your experience
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: rating >= n ? "#fde68a" : "white",
                }}
              >
                {n}★
              </button>
            ))}
            <button
              onClick={handleEndAndRate}
              style={{
                marginLeft: "auto",
                background: "#2563eb",
                color: "white",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              Submit & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderAndRide;
