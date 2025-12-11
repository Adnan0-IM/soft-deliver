import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
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
import {
  Avatar as UiAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  adminApprovePayout,
  adminGetPayouts,
  adminRejectPayout,
} from "@/features/Admin/api";

type Payout = {
  id: string | number;
  driverId: string | number;
  driverName?: string | null;
  driverAvatarUrl?: string | null;
  amount: number;
  currency?: string | null;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
};


type StatusFilter = "all" | "pending" | "approved" | "rejected";

const currency = (n?: number | null, ccy = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: ccy })
    : "-";

function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "rejected"
      ? "bg-destructive/10 text-destructive ring-border"
      : "bg-accent text-accent-foreground ring-border"; // pending/default
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  return (
    <UiAvatar className="h-9 w-9 ring-1 ring-border">
      <AvatarImage src={url ?? undefined} alt={name || "Driver"} />
      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
        {initials || "?"}
      </AvatarFallback>
    </UiAvatar>
  );
}

// using shadcn Button for filters below

/* Page */

export default function ManagePayments() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  // Row-level busy state
  const [busy, setBusy] = useState<Record<string | number, boolean>>({});

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(h);
  }, [searchInput]);

  // Reset to first page on filter/search/limit
  useEffect(() => {
    setPage(1);
  }, [status, query, limit]);

  // Fetch payouts
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await adminGetPayouts({
          status: status === "all" ? undefined : status,
          q: query || undefined,
          page,
          limit,
        });

        let list: Payout[] = [];
        let total: number | undefined;
        let pageSize = limit;

        if (Array.isArray(data)) {
          list = data;
        } else {
          list = data.data ?? [];
          total = data.total;
          pageSize = data.pageSize ?? limit;
        }

        setPayouts(list);
        setHasNext(
          typeof total === "number"
            ? page * pageSize < total
            : list.length === pageSize
        );
      } catch (e) {
        if ((e as Error)?.name !== "AbortError")
          setError((e as Error)?.message || "Failed to load payouts");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [status, query, page, limit]);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    return payouts.length
      ? `Showing ${payouts.length}${hasNext ? "+" : ""}`
      : "No payouts found";
  }, [loading, payouts, hasNext]);

  function setRowBusy(id: string | number, v: boolean) {
    setBusy((b) => ({ ...b, [id]: v }));
  }

  async function approve(p: Payout) {
    if (!p) return;
    const id = p.id;
    const prev = p.status;
    try {
      setRowBusy(id, true);
      setNotice(null);
      // optimistic
      setPayouts((rows) =>
        rows.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
      await adminApprovePayout(id);
      setNotice(`Payout #${id} approved.`);
    } catch (e) {
      setPayouts((rows) =>
        rows.map((r) => (r.id === id ? { ...r, status: prev } : r))
      );
      setError((e as Error)?.message || "Approve failed");
    } finally {
      setRowBusy(id, false);
    }
  }

  async function reject(p: Payout) {
    if (!p) return;
    if (!confirm(`Reject payout #${p.id}?`)) return;
    const id = p.id;
    const prev = p.status;
    try {
      setRowBusy(id, true);
      setNotice(null);
      // optimistic
      setPayouts((rows) =>
        rows.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
      await adminRejectPayout(id);
      setNotice(`Payout #${id} rejected.`);
    } catch (e) {
      setPayouts((rows) =>
        rows.map((r) => (r.id === id ? { ...r, status: prev } : r))
      );
      setError((e as Error)?.message || "Reject failed");
    } finally {
      setRowBusy(id, false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payout requests</h1>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search driver or ID…"
          aria-label="Search payouts"
          className="h-9 w-72"
        />
      </div>

      {notice && (
        <div className="text-sm text-primary bg-primary/10 ring-1 ring-border px-3 py-2 rounded">
          {notice}
        </div>
      )}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 ring-1 ring-border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Filters and page size */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Button
            variant={status === "all" ? "secondary" : "outline"}
            onClick={() => setStatus("all")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={status === "pending" ? "secondary" : "outline"}
            onClick={() => setStatus("pending")}
            className="rounded-full"
          >
            Pending
          </Button>
          <Button
            variant={status === "approved" ? "secondary" : "outline"}
            onClick={() => setStatus("approved")}
            className="rounded-full"
          >
            Approved
          </Button>
          <Button
            variant={status === "rejected" ? "secondary" : "outline"}
            onClick={() => setStatus("rejected")}
            className="rounded-full"
          >
            Rejected
          </Button>
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
              <TableHead className="text-left">Driver</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Requested</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && payouts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No payouts found
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              payouts.map((p) => {
                const id = p.id;
                const rowBusy = !!busy[id];
                const ccy = p.currency || "USD";
                return (
                  <TableRow key={id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={p.driverName} url={p.driverAvatarUrl} />
                        <div className="leading-5">
                          <div className="font-medium">
                            {p.driverName || "—"}
                          </div>
                          <Link
                            to={`/admin/drivers/${encodeURIComponent(
                              String(p.driverId)
                            )}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View driver
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {currency(p.amount, ccy)}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={p.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => approve(p)}
                          disabled={
                            rowBusy ||
                            (p.status || "").toLowerCase() !== "pending"
                          }
                          className="h-8"
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => reject(p)}
                          variant="outline"
                          disabled={
                            rowBusy ||
                            (p.status || "").toLowerCase() !== "pending"
                          }
                          className="h-8 text-destructive border-destructive hover:bg-destructive/10"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          Page {page}
          {payouts.length > 0
            ? ` • ${payouts.length} row${payouts.length > 1 ? "s" : ""}`
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
