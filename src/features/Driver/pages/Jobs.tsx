import { useEffect, useMemo, useRef, useState } from "react";
import { useDriverStore } from "../store";
import { goOnline, goOffline, sendDriverLocation } from "../api";
import { connectDriverRequestsWS, disconnectDriverRequestsWS } from "../ws";
import JobModal from "../components/Job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Jobs</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Status and toggle */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <strong>Status:</strong>
          <Badge
            className="capitalize"
            variant={isOnline ? "secondary" : "outline"}
          >
            {statusLabel}
          </Badge>
          <Badge
            variant={wsConnected ? "secondary" : "outline"}
            title={wsConnected ? "Subscribed to job events" : "Not subscribed"}
          >
            WS: {wsConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={onToggle} disabled={toggling} className="ml-auto">
            {toggling ? "Updating…" : isOnline ? "Go Offline" : "Go Online"}
          </Button>
        </CardContent>
      </Card>

      {/* Job area */}
      <Card
        aria-disabled={!isOnline}
        className={!isOnline ? "pointer-events-none opacity-60 grayscale" : ""}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Incoming Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isOnline ? (
            lastRequest ? (
              <p className="text-sm">
                New request received. See details in modal.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Waiting for jobs…</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              You are offline. Go online to receive jobs.
            </p>
          )}
        </CardContent>
      </Card>

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
