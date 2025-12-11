import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getJob, updateJobStatus, sendDriverLocation } from "../api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobStatus =
  | "going_to_pickup"
  | "arrived"
  | "picked_up"
  | "dropping_off"
  | "completed";

type JobDetails = {
  id: string;
  status: JobStatus;
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
  customer?: { name?: string; phone?: string };
  earnings?: { base?: number; tip?: number; total?: number };
};

export default function JobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [driverLoc, setDriverLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Geolocation watch
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;
    (async () => {
      setError(null);
      try {
        const data = await getJob(jobId);
        if (!mounted) return;
        setJob(data);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load job.");
      }
    })();

    // Start geolocation
    startLocationWatch();

    return () => {
      mounted = false;
      stopLocationWatch();
    };
  }, [jobId]);

  const startLocationWatch = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by this browser.");
      return;
    }
    if (watchIdRef.current != null) return;

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLoc({ lat: latitude, lng: longitude });

        const now = Date.now();
        // throttle: ~7s between sends
        if (now - lastSentRef.current < 7000) return;
        lastSentRef.current = now;

        try {
          await sendDriverLocation({
            lat: latitude,
            lng: longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading ?? undefined,
            speed: pos.coords.speed ?? undefined,
          });
        } catch {
          // Ignore location send errors silently
        }
      },
      (err) => setError(err.message || "Failed to acquire location."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );

    watchIdRef.current = id;
  };

  const stopLocationWatch = () => {
    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } catch {
        console.log("Failed to clear geolocation watch");
      }
      watchIdRef.current = null;
    }
  };

  const statusLabel = useMemo(() => {
    switch (job?.status) {
      case "going_to_pickup":
        return "Going to pickup";
      case "arrived":
        return "Arrived";
      case "picked_up":
        return "Picked up";
      case "dropping_off":
        return "Dropping off";
      case "completed":
        return "Completed";
      default:
        return "—";
    }
  }, [job?.status]);

  const setStatus = async (next: JobStatus) => {
    if (!job || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await updateJobStatus(job.id, next);
      setJob(updated);
      if (next === "completed") {
        // Navigate back to jobs list or summary
        navigate("/driver/jobs");
      }
    } catch (e) {
      setError((e as Error)?.message || "Failed to update job status.");
    } finally {
      setBusy(false);
    }
  };

  if (!job) {
    return (
      <div className="container px-4 lg:px-8 py-4">
        <h2 className="text-2xl font-semibold">Job</h2>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
      </div>
    );
  }

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Job #{job.id}</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Map placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Map</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm">
          <div className="text-foreground/80">
            Driver:{" "}
            {driverLoc
              ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}`
              : "Locating…"}
          </div>
          <div className="text-foreground/80">
            Pickup:{" "}
            {job.pickup
              ? `${job.pickup.lat.toFixed(5)}, ${job.pickup.lng.toFixed(5)}`
              : "—"}
          </div>
          <div className="text-foreground/80">
            Drop-off:{" "}
            {job.dropoff
              ? `${job.dropoff.lat.toFixed(5)}, ${job.dropoff.lng.toFixed(5)}`
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            (Integrate your map library here: Google Maps, Mapbox GL, Leaflet,
            etc.)
          </div>
        </CardContent>
      </Card>

      {/* Status box + actions */}
      <Card>
        <CardContent className="grid gap-3 py-4">
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <Badge variant="secondary">{statusLabel}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStatus("arrived")}
              disabled={busy || job.status !== "going_to_pickup"}
            >
              Arrived
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatus("picked_up")}
              disabled={
                busy ||
                (job.status !== "arrived" && job.status !== "going_to_pickup")
              }
            >
              Pick Up
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatus("dropping_off")}
              disabled={busy || job.status !== "picked_up"}
            >
              Dropping Off
            </Button>
            <Button
              className="ml-auto"
              onClick={() => setStatus("completed")}
              disabled={busy || job.status !== "dropping_off"}
            >
              Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid text-sm">
          <div>Name: {job.customer?.name ?? "—"}</div>
          <div>Phone: {job.customer?.phone ?? "—"}</div>
        </CardContent>
      </Card>

      {/* Earnings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid text-sm">
          <div>
            Base:{" "}
            {typeof job.earnings?.base === "number"
              ? `$${job.earnings!.base.toFixed(2)}`
              : "—"}
          </div>
          <div>
            Tip:{" "}
            {typeof job.earnings?.tip === "number"
              ? `$${job.earnings!.tip.toFixed(2)}`
              : "—"}
          </div>
          <div>
            Total:{" "}
            {typeof job.earnings?.total === "number"
              ? `$${job.earnings!.total.toFixed(2)}`
              : "—"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
