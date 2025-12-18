import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ScrollAreaC from "./scroll-area";

type NotificationType = "ride" | "delivery" | "promo";

export type NotificationItem = {
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

export const NotificationsC = () => {
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
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // In real app: await fetch(`/user/notifications/${id}/read`, { method: 'POST' });
  };

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    // In real app: await fetch(`/user/notifications/read-all`, { method: 'POST' });
  };
  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-48">
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ride">Ride</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
            />
          </div>
          <div>
            <Button
              className="text-sm sm:text-base"
              variant="secondary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>

      {!loading && filtered.length === 0 && (
        <div className="text-muted-foreground">No notifications.</div>
      )}
      <ScrollAreaC
        loading={loading}
        error={error}
        filtered={filtered}
        markAsRead={markAsRead}
      />
    </>
  );
};
