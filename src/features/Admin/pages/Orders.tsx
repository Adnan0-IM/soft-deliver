import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Order = {
  id: string | number;
  type: "ride" | "delivery" | string;
  status: "pending" | "assigned" | "completed" | "cancelled" | string;
  userName?: string | null;
  driverName?: string | null;
  pickup?: string | null;
  dropoff?: string | null;
  amount: number;
  createdAt: string;
};


type TypeFilter = "all" | "ride" | "delivery";
type StatusFilter = "all" | "pending" | "assigned" | "completed" | "cancelled";

import { adminGetOrders } from "@/features/Admin/api";

const currency = (n?: number | null, ccy = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: ccy })
    : "-";

export default function Orders() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const lockedUserId = urlParams.get("userId") || undefined;
  const lockedDriverId = urlParams.get("driverId") || undefined;

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  // Debounce search input
  useEffect(() => {
    const h = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(h);
  }, [searchInput]);

  // Reset to first page on filter/search/limit change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, query, limit, lockedUserId, lockedDriverId]);

  // Fetch orders
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (typeFilter !== "all") params.set("type", typeFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (query) params.set("q", query);
        if (lockedUserId) params.set("userId", lockedUserId);
        if (lockedDriverId) params.set("driverId", lockedDriverId);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const data = await adminGetOrders({
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          q: query || undefined,
          userId: lockedUserId,
          driverId: lockedDriverId,
          page,
          limit,
        });

        let list: Order[] = [];
        let total: number | undefined;
        let pageSize = limit;

        if (Array.isArray(data)) {
          list = data as unknown as Order[];
        } else if (data && typeof data === "object") {
          list = (data.data as unknown as Order[]) ?? [];
          total = data.total;
          pageSize = data.pageSize ?? limit;
        }

        setOrders(list);
        setHasNext(
          typeof total === "number"
            ? page * pageSize < total
            : list.length === pageSize
        );
      } catch (e) {
        if ((e as Error)?.name !== "AbortError")
          setError((e as Error)?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [
    typeFilter,
    statusFilter,
    query,
    page,
    limit,
    lockedUserId,
    lockedDriverId,
  ]);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    return orders.length
      ? `Showing ${orders.length}${hasNext ? "+" : ""}`
      : "No orders found";
  }, [loading, orders, hasNext]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by ID, user, driver…"
            aria-label="Search orders"
            className="h-9 w-80"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 ring-1 ring-border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Button
              variant={typeFilter === "all" ? "secondary" : "outline"}
              onClick={() => setTypeFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={typeFilter === "ride" ? "secondary" : "outline"}
              onClick={() => setTypeFilter("ride")}
              className="rounded-full"
            >
              Ride
            </Button>
            <Button
              variant={typeFilter === "delivery" ? "secondary" : "outline"}
              onClick={() => setTypeFilter("delivery")}
              className="rounded-full"
            >
              Delivery
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Button
              variant={statusFilter === "all" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "pending" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className="rounded-full"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "assigned" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("assigned")}
              className="rounded-full"
            >
              Assigned
            </Button>
            <Button
              variant={statusFilter === "completed" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("completed")}
              className="rounded-full"
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("cancelled")}
              className="rounded-full"
            >
              Cancelled
            </Button>
          </div>

          {(lockedUserId || lockedDriverId) && (
            <span className="text-xs text-muted-foreground">
              Scoped to {lockedUserId ? `user #${lockedUserId}` : ""}
              {lockedUserId && lockedDriverId ? " • " : ""}
              {lockedDriverId ? `driver #${lockedDriverId}` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{countLabel}</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg ring-1 ring-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Type</TableHead>
              <TableHead className="text-left">User</TableHead>
              <TableHead className="text-left">Driver</TableHead>
              <TableHead className="text-left">Pickup</TableHead>
              <TableHead className="text-left">Drop-off</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <TypePill type={o.type} />
                  </TableCell>
                  <TableCell>{o.userName || "—"}</TableCell>
                  <TableCell>{o.driverName || "—"}</TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {o.pickup || "—"}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {o.dropoff || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {currency(o.amount)}
                  </TableCell>
                  <TableCell>
                    <OrderStatus status={o.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to={`/admin/orders/${encodeURIComponent(String(o.id))}`}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Page {page}
          {orders.length > 0
            ? ` • ${orders.length} row${orders.length > 1 ? "s" : ""}`
            : ""}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* UI bits */

// using shadcn Button/Table/Select above

function OrderStatus({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "completed" || s === "delivered"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "assigned" || s === "pending"
      ? "bg-accent text-accent-foreground ring-border"
      : s === "cancelled"
      ? "bg-destructive/10 text-destructive ring-border"
      : "bg-muted text-foreground ring-border";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function TypePill({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();
  const cls =
    t === "ride"
      ? "bg-primary/10 text-primary ring-border"
      : t === "delivery"
      ? "bg-secondary text-secondary-foreground ring-border"
      : "bg-muted text-foreground ring-border";
  return <Badge className={`capitalize ${cls}`}>{type || "—"}</Badge>;
}
