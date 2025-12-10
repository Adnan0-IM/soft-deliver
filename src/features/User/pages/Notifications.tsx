import React, { useEffect, useMemo, useState } from "react";

type NotificationType = "ride" | "delivery" | "promo";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
};

const mockFetchNotifications = async (): Promise<NotificationItem[]> => {
  await new Promise((r) => setTimeout(r, 400));
  const now = Date.now();
  return [
    {
      id: "n1",
      type: "ride",
      title: "Ride completed",
      body: "Your ride to Airport T1 has been completed.",
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "n2",
      type: "delivery",
      title: "Delivery in transit",
      body: "Package to 789 Oak Rd is on the way.",
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "n3",
      type: "promo",
      title: "Promo: 20% off",
      body: "Use code SAVE20 on your next ride.",
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ];
};

const Notifications: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your API:
        // const res = await fetch('/user/notifications');
        // const data = await res.json();
        const data = await mockFetchNotifications();
        setItems(data);
      } catch {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (filter === "all" ? true : i.type === filter))
      .filter((i) => {
        if (!q) return true;
        return (
          i.title.toLowerCase().includes(q) ||
          i.body.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [items, filter, query]);

  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // In real app: await fetch(`/user/notifications/${id}/read`, { method: 'POST' });
  };

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    // In real app: await fetch(`/user/notifications/read-all`, { method: 'POST' });
  };

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}>
      <h2>Notifications</h2>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          style={{ padding: 8 }}
        >
          <option value="all">All</option>
          <option value="ride">Ride</option>
          <option value="delivery">Delivery</option>
          <option value="promo">Promo</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notifications..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={markAllAsRead} style={{ padding: "8px 12px" }}>
          Mark all as read
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ color: "#6b7280" }}>No notifications.</div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
              background: n.read ? "#f9fafb" : "#fff",
              display: "grid",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background:
                    n.type === "ride"
                      ? "#dbeafe"
                      : n.type === "delivery"
                      ? "#d1fae5"
                      : "#fde68a",
                  fontSize: 12,
                }}
              >
                {n.type}
              </span>
              {!n.read && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "#2563eb",
                  }}
                >
                  New
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div style={{ color: "#6b7280" }}>{n.body}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  style={{
                    marginLeft: "auto",
                    padding: "6px 10px",
                    background: "#2563eb",
                    color: "white",
                    borderRadius: 6,
                  }}
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
