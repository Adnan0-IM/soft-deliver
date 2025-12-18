import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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

const TrackOrderAndRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [statusIndex, setStatusIndex] = useState(0);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(
    initialDriverLocation,
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
    navigate("/user/home");
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
      <Card className="mb-3 bg-muted/40">
        <CardContent className="p-3">
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground">
            Status: {currentStatus.replace("_", " ")}
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusProgress: React.FC = () => (
    <div className="flex gap-2 flex-wrap mb-3">
      {statusSequence.map((s, i) => (
        <Badge key={s} variant={i === statusIndex ? "default" : "secondary"}>
          {s.replace("_", " ")}
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="container px-4 lg:px-8 mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-2">Tracking {id}</h2>

      <StatusBox />
      <StatusProgress />

      <Card className="gap-4">
        <CardHeader className="">
          <CardTitle className="text-sm sm:text-base">Live Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="h-[360px] bg-muted rounded-md"
            aria-label="Map placeholder"
          />
          <div className="text-xs text-muted-foreground mt-2">
            Driver:{" "}
            {driverLocation
              ? `${driverLocation.lat.toFixed(5)}, ${driverLocation.lng.toFixed(
                  5,
                )}`
              : "—"}{" "}
            | User:{" "}
            {`${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 mt-4 md:grid-cols-2">
        <Card className="gap-4">
          <CardHeader className="">
            <CardTitle className=" text-sm sm:text-base">Driver</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {driverInfo ? (
              <div>
                <div className="font-medium">{driverInfo.name}</div>
                <div className="text-muted-foreground text-sm">
                  {driverInfo.vehicle}
                </div>
                {driverInfo.phone && (
                  <div className="text-muted-foreground text-xs">
                    {driverInfo.phone}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Searching for driver…</div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader className="">
            <CardTitle className="text-sm sm:text-base">Trip</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div>Distance: {distanceKm ?? "—"} km</div>
            <div>ETA: {etaMin ?? "—"} min</div>
            <div>Cost: {price !== null ? `$${price}` : "—"}</div>
          </CardContent>
        </Card>
      </div>

      {currentStatus === "completed" && (
        <Card className="mt-4 gap-4">
          <CardHeader className="">
            <CardTitle className="text-sm sm:text-base">
              Rate your experience
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  className="border-0 shadow-none px-2"
                  variant={rating >= n ? "default" : "outline"}
                  size="icon"
                  onClick={() => setRating(n)}
                >
                  <Star fill="gold" className="text-amber-300" />
                </Button>
              ))}
            </div>

            <Button className="sm:ml-auto" onClick={handleEndAndRate}>
              Submit & Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackOrderAndRide;
