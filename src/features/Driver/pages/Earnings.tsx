import { useEffect, useMemo, useState } from "react";
import { getDriverEarnings } from "../api";

type EarningsSummary = {
  today: number;
  weekTotal: number;
  total: number;
  pendingPayout: number;
  completedPayouts: Array<{ id: string; amount: number; date: string }>;
  weeklyChart?: Array<{ date: string; amount: number }>; // last 7 days
};

const currency = (n: number | undefined) =>
  (typeof n === "number" ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

export default function Earnings() {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getDriverEarnings();
        if (!mounted) return;
        setData(res);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load earnings.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const weekly = useMemo(() => data?.weeklyChart ?? [], [data]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Earnings</h2>

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

      {/* Summary cards */}
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
          <h3 style={{ marginTop: 0 }}>Today’s Earnings</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {loading ? "—" : currency(data?.today)}
          </p>
        </div>
        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Weekly Total</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {loading ? "—" : currency(data?.weekTotal)}
          </p>
        </div>
        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Total Earnings</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {loading ? "—" : currency(data?.total)}
          </p>
        </div>
        <div
          style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <h3 style={{ marginTop: 0 }}>Pending Payout</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {loading ? "—" : currency(data?.pendingPayout)}
          </p>
        </div>
      </section>

      {/* Weekly chart placeholder */}
      <section
        style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
      >
        <h3 style={{ marginTop: 0 }}>Weekly Chart</h3>
        {loading ? (
          <p>Loading…</p>
        ) : weekly.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No chart data.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${weekly.length}, 1fr)`,
              gap: 8,
            }}
          >
            {weekly.map((d) => (
              <div key={d.date} style={{ textAlign: "center" }}>
                <div
                  title={`${new Date(d.date).toLocaleDateString()}: ${currency(
                    d.amount
                  )}`}
                  style={{
                    height:
                      Math.max(8, Math.min(120, Math.round(d.amount))) + "px",
                    background: "#111827",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {new Date(d.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          (Optional: replace with Chart.js or Recharts.)
        </div>
      </section>

      {/* Completed payout history */}
      <section
        style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
      >
        <h3 style={{ marginTop: 0 }}>Completed Payouts</h3>
        {loading ? (
          <p>Loading…</p>
        ) : data?.completedPayouts?.length ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.completedPayouts.map((p) => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                {new Date(p.date).toLocaleString()} — {currency(p.amount)}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>No completed payouts.</p>
        )}
      </section>
    </div>
  );
}
