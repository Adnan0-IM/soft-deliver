import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getJob, updateJobStatus, sendDriverLocation } from "../api";

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
      <div style={{ padding: 16 }}>
        <h2>Job</h2>
        {error ? <p style={{ color: "#a40000" }}>{error}</p> : <p>Loading…</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Job #{job.id}</h2>

      {error && (
        <div
          style={{
            padding: 12,
            background: "#ffe5e5",
            color: "#a40000",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* Map placeholder */}
      <section
        style={{
          height: 320,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 8,
          display: "grid",
          gap: 6,
          background: "#f9fafb",
        }}
      >
        <strong>Map</strong>
        <div style={{ fontSize: 12, color: "#374151" }}>
          Driver:{" "}
          {driverLoc
            ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}`
            : "Locating…"}
        </div>
        <div style={{ fontSize: 12, color: "#374151" }}>
          Pickup:{" "}
          {job.pickup
            ? `${job.pickup.lat.toFixed(5)}, ${job.pickup.lng.toFixed(5)}`
            : "—"}
        </div>
        <div style={{ fontSize: 12, color: "#374151" }}>
          Drop-off:{" "}
          {job.dropoff
            ? `${job.dropoff.lat.toFixed(5)}, ${job.dropoff.lng.toFixed(5)}`
            : "—"}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          (Integrate your map library here: Google Maps, Mapbox GL, Leaflet,
          etc.)
        </div>
      </section>

      {/* Status box + actions */}
      <section
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <div>
          <strong>Status:</strong>{" "}
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "#e0e7ff",
              color: "#3730a3",
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setStatus("arrived")}
            disabled={busy || job.status !== "going_to_pickup"}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          >
            Arrived
          </button>
          <button
            onClick={() => setStatus("picked_up")}
            disabled={
              busy ||
              (job.status !== "arrived" && job.status !== "going_to_pickup")
            }
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          >
            Pick Up
          </button>
          <button
            onClick={() => setStatus("dropping_off")}
            disabled={busy || job.status !== "picked_up"}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          >
            Dropping Off
          </button>
          <button
            onClick={() => setStatus("completed")}
            disabled={busy || job.status !== "dropping_off"}
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#111827",
              color: "white",
            }}
          >
            Complete
          </button>
        </div>
      </section>

      {/* Customer info */}
      <section
        style={{
          display: "grid",
          gap: 8,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Customer</h3>
        <div>Name: {job.customer?.name ?? "—"}</div>
        <div>Phone: {job.customer?.phone ?? "—"}</div>
      </section>

      {/* Earnings */}
      <section
        style={{
          display: "grid",
          gap: 8,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Earnings</h3>
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
      </section>
    </div>
  );
}
