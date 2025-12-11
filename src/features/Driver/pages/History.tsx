import { useEffect, useMemo, useState } from "react";
import { getDriverHistory } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
        const normalizeList = (input: unknown): HistoryItem[] => {
          if (Array.isArray(input)) return input as HistoryItem[];
          if (input && typeof input === "object") {
            const obj = input as { data?: unknown; items?: unknown };
            const arr = Array.isArray(obj.data)
              ? (obj.data as HistoryItem[])
              : Array.isArray(obj.items)
              ? (obj.items as HistoryItem[])
              : [];
            return arr;
          }
          return [] as HistoryItem[];
        };
        setItems(normalizeList(data));
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

  const filtered = useMemo<HistoryItem[]>(() => {
    const base: HistoryItem[] = Array.isArray(items) ? items : [];
    return filter === "all" ? base : base.filter((i) => i.type === filter);
  }, [items, filter]);

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">History</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === "delivery" ? "default" : "outline"}
          onClick={() => setFilter("delivery")}
          size="sm"
        >
          Delivery
        </Button>
        <Button
          variant={filter === "ride" ? "default" : "outline"}
          onClick={() => setFilter("ride")}
          size="sm"
        >
          Ride
        </Button>
      </section>

      {/* Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>History Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No history found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{new Date(i.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {i.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {typeof i.distanceKm === "number"
                        ? `${i.distanceKm.toFixed(2)} km`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {typeof i.earnings === "number"
                        ? `$${i.earnings.toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {i.status ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
