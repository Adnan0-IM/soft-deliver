import  { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDriverStore } from "../store";
import {
  getDriverStatus,
  setDriverStatus as apiSetDriverStatus,
  getDriverSummary,
} from "../api";
import { connectDriverRequestsWS, disconnectDriverRequestsWS } from "../ws";

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
      } catch (e ) {
        if (!mounted) return;
        setError(( e as Error)?.message || "Failed to load driver data.");
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
      <div style={{ padding: 16 }}>
        <h2>Driver Dashboard</h2>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Driver Dashboard</h2>

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

      {/* Online/Offline Toggle */}
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
            background: driverStatus === "online" ? "#dcfce7" : "#fee2e2",
            color: driverStatus === "online" ? "#065f46" : "#991b1b",
            fontWeight: 600,
          }}
        >
          {statusLabel}
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
          aria-busy={toggling}
        >
          {toggling
            ? "Updating…"
            : driverStatus === "online"
            ? "Go Offline"
            : "Go Online"}
        </button>
      </section>

      {/* Cards */}
      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Active Job</h3>
          {currentJobId ? (
            <div>
              <p style={{ margin: "8px 0" }}>Job ID: {currentJobId}</p>
              <button
                onClick={() => navigate(`/driver/jobs/${currentJobId}`)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
              >
                View Job
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: "#6b7280" }}>No active job</p>
          )}
        </div>

        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Today’s Earnings</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {currency(todaysEarnings)}
          </p>
        </div>

        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Pending Payout</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {currency(pendingPayout)}
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate("/driver/jobs")}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        >
          View Jobs
        </button>
        <button
          onClick={() => navigate("/driver/wallet")}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        >
          View Wallet
        </button>
      </section>
    </div>
  );
}
