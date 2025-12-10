import { useEffect, useMemo, useState } from "react";
import { getDriverHistory } from "../api";

type HistoryItem = {
  id: string;
  type: "delivery" | "ride";
  date: string; // ISO string
  distanceKm?: number;
  earnings?: number;
  status?: string; // e.g., "completed", "cancelled"
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "delivery" | "ride">("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await getDriverHistory();
        if (!mounted) return;
        setItems(data);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load history.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>History</h2>

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

      {/* Filters */}
      <section style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: filter === "all" ? "#111827" : "white",
            color: filter === "all" ? "white" : "#111827",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("delivery")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: filter === "delivery" ? "#111827" : "white",
            color: filter === "delivery" ? "white" : "#111827",
          }}
        >
          Delivery
        </button>
        <button
          onClick={() => setFilter("ride")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: filter === "ride" ? "#111827" : "white",
            color: filter === "ride" ? "white" : "#111827",
          }}
        >
          Ride
        </button>
      </section>

      {/* Table */}
      <section
        style={{
          overflowX: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "#6b7280" }}>No history found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Distance
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Earnings
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {new Date(i.date).toLocaleString()}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {i.type}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {typeof i.distanceKm === "number"
                      ? `${i.distanceKm.toFixed(2)} km`
                      : "—"}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {typeof i.earnings === "number"
                      ? `$${i.earnings.toFixed(2)}`
                      : "—"}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {i.status ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
