import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HistoryTable from "./history-table";
import { Card, CardContent } from "@/components/ui/card";

export type HistoryItem = {
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

export const HistoryC = () => {
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
        const list = data;
        setItems(list as HistoryItem[]);
      } catch {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo<HistoryItem[]>(() => {
    const list: HistoryItem[] = items;
    return list
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

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-48">
            <Label className="mb-1 block">Filter</Label>
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ride">Ride only</SelectItem>
                <SelectItem value="delivery">Delivery only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="mb-1 block">Search</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by address, status..."
            />
          </div>
        </CardContent>
      </Card>
      {!loading && filtered.length === 0 && (
        <div className="text-muted-foreground">No history found.</div>
      )}
      {!loading && filtered.length > 0 && (
        <HistoryTable filtered={filtered} loading={loading} error={error} />
      )}
    </>
  );
};
