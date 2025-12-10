import { useEffect, useMemo, useRef, useState } from "react";
import { useDriverStore } from "../store";
import { goOnline, goOffline, sendDriverLocation } from "../api";
import { connectDriverRequestsWS, disconnectDriverRequestsWS } from "../ws";
import JobModal from "../components/Job";

type JobRequest = {
  id: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  price?: number;
  etaToPickupMins?: number;
};

export default function Jobs() {
  const { driverStatus, setDriverStatus } = useDriverStore();

  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastRequest, setLastRequest] = useState<JobRequest | null>(null);

  // Geolocation watch ID and throttle
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const isOnline = driverStatus === "online";

  const statusLabel = useMemo(
    () => (isOnline ? "Online" : "Offline"),
    [isOnline]
  );

  // WebSocket + location lifecycle tied to driverStatus
  useEffect(() => {
    if (isOnline) {
      // Connect WS
      connectDriverRequestsWS({
        onOpen: () => setWsConnected(true),
        onClose: () => setWsConnected(false),
        onError: () => setWsConnected(false),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRequest: (payload: any) => {
          // Normalize a bit
          const req: JobRequest = {
            id: payload?.id ?? payload?.jobId ?? "unknown",
            pickupAddress: payload?.pickupAddress,
            dropoffAddress: payload?.dropoffAddress,
            price: payload?.price,
            etaToPickupMins: payload?.etaToPickupMins,
          };
          setLastRequest(req);
        },
      });

      // Start location updates
      startLocationWatch();
    } else {
      // Cleanup when offline
      disconnectDriverRequestsWS();
      setWsConnected(false);
      stopLocationWatch();
      setLastRequest(null);
    }

    return () => {
      // Cleanup on unmount
      disconnectDriverRequestsWS();
      setWsConnected(false);
      stopLocationWatch();
    };
  }, [isOnline]);

  const startLocationWatch = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by this browser.");
      return;
    }
    // Avoid duplicate watches
    if (watchIdRef.current != null) return;

    setError(null);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < 4000) return; // throttle ~4s
        lastSentRef.current = now;

        const { latitude, longitude, accuracy, heading, speed } = pos.coords;
        try {
          await sendDriverLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            heading: heading ?? undefined,
            speed: speed ?? undefined,
          });
        } catch (e) {
          // Don't spam UI, only log
          console.debug("Location update failed:", (e as Error)?.message || e);
        }
      },
      (err) => {
        setError(err.message || "Failed to acquire location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    watchIdRef.current = id;
  };

  const stopLocationWatch = () => {
    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } catch {
        // ignore
      }
      watchIdRef.current = null;
    }
  };

  const onToggle = async () => {
    if (toggling) return;
    setToggling(true);
    setError(null);
    try {
      if (isOnline) {
        await goOffline();
        setDriverStatus("offline");
      } else {
        await goOnline();
        setDriverStatus("online");
      }
    } catch (e) {
      setError((e as Error)?.message || "Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Jobs</h2>

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

      {/* Status and toggle */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <strong>Status:</strong>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 999,
            background: isOnline ? "#dcfce7" : "#fee2e2",
            color: isOnline ? "#065f46" : "#991b1b",
            fontWeight: 600,
          }}
        >
          {statusLabel}
        </span>
        <span
          title={wsConnected ? "Subscribed to job events" : "Not subscribed"}
          style={{
            marginLeft: 8,
            padding: "2px 8px",
            borderRadius: 999,
            background: wsConnected ? "#e0e7ff" : "#f3f4f6",
            color: wsConnected ? "#3730a3" : "#4b5563",
            fontWeight: 600,
          }}
        >
          WS: {wsConnected ? "Connected" : "Disconnected"}
        </span>
        <button
          onClick={onToggle}
          disabled={toggling}
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "#111827",
            color: "white",
            cursor: toggling ? "not-allowed" : "pointer",
          }}
        >
          {toggling ? "Updating…" : isOnline ? "Go Offline" : "Go Online"}
        </button>
      </section>

      {/* Job area */}
      <section
        style={{
          position: "relative",
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          filter: isOnline ? "none" : "grayscale(1)",
          opacity: isOnline ? 1 : 0.6,
          pointerEvents: isOnline ? "auto" : "none",
        }}
        aria-disabled={!isOnline}
      >
        <h3 style={{ marginTop: 0 }}>Incoming Jobs</h3>
        {isOnline ? (
          lastRequest ? (
            <p style={{ margin: 0, color: "#111827" }}>
              New request received. See details in modal.
            </p>
          ) : (
            <p style={{ margin: 0, color: "#6b7280" }}>Waiting for jobs…</p>
          )
        ) : (
          <p style={{ margin: 0, color: "#6b7280" }}>
            You are offline. Go online to receive jobs.
          </p>
        )}
      </section>

      {/* Modal */}
      {lastRequest && (
        <JobModal
          job={{
            id: lastRequest.id,
            pickupAddress: lastRequest.pickupAddress,
            dropoffAddress: lastRequest.dropoffAddress,
            price: lastRequest.price,
            distanceKm: undefined,
            timeEstimateMins: lastRequest.etaToPickupMins,
          }}
          onClose={() => setLastRequest(null)}
        />
      )}
    </div>
  );
}
