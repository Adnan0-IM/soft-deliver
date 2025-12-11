import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDriverStore } from "../store";
import {
  getDriverStatus,
  setDriverStatus as apiSetDriverStatus,
  getDriverSummary,
} from "../api";
import { connectDriverRequestsWS, disconnectDriverRequestsWS } from "../ws";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currency = (n: number | undefined) =>
  (typeof n === "number" ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    driverStatus,
    currentJobId,
    todaysEarnings,
    pendingPayout,
    setDriverStatus,
    setCurrentJobId,
    setSummary,
  } = useDriverStore();

  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load: sync status + summary from backend
  useEffect(() => {
    let mounted = true;

    (async () => {
      setError(null);
      try {
        const [status, summary] = await Promise.all([
          getDriverStatus(),
          getDriverSummary(),
        ]);
        if (!mounted) return;

        setDriverStatus(status);
        setSummary(summary);
        if (summary.activeJobId) setCurrentJobId(summary.activeJobId);

        if (status === "online") {
          connectDriverRequestsWS({
            onRequest: (payload) => {
              // Handle incoming job requests here (e.g., open modal/notification)
              console.debug("Job request:", payload);
            },
            onError: (e) => console.warn("WS error:", e?.message || e),
          });
        }
      } catch (e) {
        if (!mounted) return;
        setError((e as Error)?.message || "Failed to load driver data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      disconnectDriverRequestsWS();
    };
  }, [setDriverStatus, setSummary, setCurrentJobId]);

  // Toggle Online/Offline
  const onToggle = async () => {
    if (toggling) return;
    setToggling(true);
    setError(null);
    try {
      const next = driverStatus === "online" ? "offline" : "online";
      await apiSetDriverStatus(next);
      setDriverStatus(next);
      if (next === "online") {
        connectDriverRequestsWS({
          onRequest: (payload) => console.debug("Job request:", payload),
          onError: (e) => console.warn("WS error:", e?.message || e),
        });
      } else {
        disconnectDriverRequestsWS();
      }
    } catch (e) {
      setError((e as Error)?.message || "Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  const statusLabel = useMemo(
    () => (driverStatus === "online" ? "Online" : "Offline"),
    [driverStatus]
  );

  if (loading) {
    return (
      <div className="container px-4 lg:px-8 py-4">
        <h2 className="text-2xl font-semibold">Driver Dashboard</h2>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Driver Dashboard</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Online/Offline Toggle */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <strong>Status:</strong>
          <Badge variant="secondary" className="capitalize">
            {statusLabel}
          </Badge>
          <Button onClick={onToggle} disabled={toggling} className="ml-auto">
            {toggling
              ? "Updating…"
              : driverStatus === "online"
              ? "Go Offline"
              : "Go Online"}
          </Button>
        </CardContent>
      </Card>

      {/* Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Job</CardTitle>
          </CardHeader>
          <CardContent>
            {currentJobId ? (
              <div className="space-y-2">
                <p className="text-sm">Job ID: {currentJobId}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/driver/jobs/${currentJobId}`)}
                >
                  View Job
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground m-0">No active job</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today’s Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(todaysEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(pendingPayout)}</div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/driver/jobs")}>
          View Jobs
        </Button>
        <Button variant="outline" onClick={() => navigate("/driver/wallet")}>
          View Wallet
        </Button>
      </section>
    </div>
  );
}
