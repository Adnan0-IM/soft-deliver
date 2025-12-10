import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

type HistoryItem = {
  id: string;
  type: "ride" | "delivery";
  date: string; // ISO string
  from: string;
  to: string;
  cost: number;
  status: "completed" | "cancelled" | "in_transit";
};

const mockFetchHistory = async (): Promise<HistoryItem[]> => {
  await new Promise((r) => setTimeout(r, 500));
  return [
    {
      id: "ride_1733840000000",
      type: "ride",
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      from: "123 Main St",
      to: "Airport T1",
      cost: 9.5,
      status: "completed",
    },
    {
      id: "order_1733753600000",
      type: "delivery",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      from: "456 Market Ave",
      to: "789 Oak Rd",
      cost: 12.75,
      status: "completed",
    },
    {
      id: "ride_1733667200000",
      type: "ride",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      from: "22 Pine St",
      to: "City Center",
      cost: 7.25,
      status: "cancelled",
    },
  ];
};

const History: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "ride" | "delivery">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        // Replace with: const res = await fetch('/user/history'); const data = await res.json();
        const data = await mockFetchHistory();
        setItems(data);
      } catch {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((i) => (filter === "all" ? true : i.type === filter))
      .filter((i) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          i.from.toLowerCase().includes(q) ||
          i.to.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [items, filter, query]);

  const viewReceipt = (id: string) => {
    // Navigate to a detail page. Adjust the route to your app’s receipt page.
    navigate(`/user/receipt/${id}`);
  };

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}>
      <h2>History</h2>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          style={{ padding: 8 }}
        >
          <option value="all">All</option>
          <option value="ride">Ride only</option>
          <option value="delivery">Delivery only</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address, status..."
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ color: "#6b7280" }}>No history found.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}
              >
                <th style={{ padding: "8px 6px" }}>Date</th>
                <th style={{ padding: "8px 6px" }}>Type</th>
                <th style={{ padding: "8px 6px" }}>From</th>
                <th style={{ padding: "8px 6px" }}>To</th>
                <th style={{ padding: "8px 6px" }}>Cost</th>
                <th style={{ padding: "8px 6px" }}>Status</th>
                <th style={{ padding: "8px 6px" }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                    {new Date(i.date).toLocaleString()}
                  </td>
                  <td
                    style={{ padding: "10px 6px", textTransform: "capitalize" }}
                  >
                    {i.type}
                  </td>
                  <td style={{ padding: "10px 6px" }}>{i.from}</td>
                  <td style={{ padding: "10px 6px" }}>{i.to}</td>
                  <td style={{ padding: "10px 6px" }}>${i.cost.toFixed(2)}</td>
                  <td
                    style={{ padding: "10px 6px", textTransform: "capitalize" }}
                  >
                    {i.status.replace("_", " ")}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "right" }}>
                    <button
                      onClick={() => viewReceipt(i.id)}
                      style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "6px 10px",
                        borderRadius: 6,
                      }}
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
