import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminGetDrivers } from "@/features/Admin/api";
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

type Driver = {
  id: string | number;
  name: string;
  phone?: string | null;
  vehicle?:
    | string
    | {
        make?: string | null;
        model?: string | null;
        plate?: string | null;
      }
    | null;
  status: "approved" | "pending" | string; // approval status
  online?: boolean;
  presence?: "online" | "offline";
  earnings?: number;
  avatarUrl?: string | null;
  createdAt?: string;
};


type ApprovalFilter = "all" | "approved" | "pending";
type PresenceFilter = "all" | "online" | "offline";

const currency = (n?: number | null, ccy = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: ccy })
    : "-";

function vehicleText(v?: Driver["vehicle"]) {
  if (!v) return "—";
  if (typeof v === "string") return v || "—";
  const parts = [v.make, v.model, v.plate ? `(${v.plate})` : undefined].filter(
    Boolean
  );
  return parts.length ? parts.join(" ") : "—";
}

function isOnline(d: Driver) {
  if (typeof d.online === "boolean") return d.online;
  if (d.presence) return d.presence.toLowerCase() === "online";
  return false;
}

export default function Drivers() {
  const [approval, setApproval] = useState<ApprovalFilter>("all");
  const [presence, setPresence] = useState<PresenceFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(h);
  }, [searchInput]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [approval, presence, query, limit]);

  // Fetch drivers
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (approval !== "all") params.set("status", approval); // approved|pending
        if (presence !== "all")
          params.set("online", String(presence === "online"));
        if (query) params.set("q", query);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const data = await adminGetDrivers({
          status: approval === "all" ? undefined : approval,
          online: presence === "all" ? undefined : presence === "online",
          q: query || undefined,
          page,
          limit,
        });

        let list: Driver[] = [];
        let total: number | undefined;
        let pageSize = limit;

        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === "object") {
          list = data.data ?? [];
          total = data.total;
          pageSize = data.pageSize ?? limit;
        }

        setDrivers(list);
        setHasNext(
          typeof total === "number"
            ? page * pageSize < total
            : list.length === pageSize
        );
      } catch (e) {
        if ((e as Error)?.name !== "AbortError")
          setError((e as Error)?.message || "Failed to load drivers");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [approval, presence, query, page, limit]);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    return drivers.length
      ? `Showing ${drivers.length}${hasNext ? "+" : ""}`
      : "No drivers found";
  }, [loading, drivers, hasNext]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <div className="flex items-center gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or phone…"
            aria-label="Search drivers"
            className="h-9 w-72"
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">Approval:</span>
          <Button
            variant={approval === "all" ? "secondary" : "outline"}
            onClick={() => setApproval("all")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={approval === "approved" ? "secondary" : "outline"}
            onClick={() => setApproval("approved")}
            className="rounded-full"
          >
            Approved
          </Button>
          <Button
            variant={approval === "pending" ? "secondary" : "outline"}
            onClick={() => setApproval("pending")}
            className="rounded-full"
          >
            Pending
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">
              Presence:
            </span>
            <Button
              variant={presence === "all" ? "secondary" : "outline"}
              onClick={() => setPresence("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={presence === "online" ? "secondary" : "outline"}
              onClick={() => setPresence("online")}
              className="rounded-full"
            >
              Online
            </Button>
            <Button
              variant={presence === "offline" ? "secondary" : "outline"}
              onClick={() => setPresence("offline")}
              className="rounded-full"
            >
              Offline
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
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg ring-1 ring-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Phone</TableHead>
              <TableHead className="text-left">Vehicle</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Online</TableHead>
              <TableHead className="text-right">Earnings</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && drivers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No drivers found
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              drivers.map((d) => {
                const online = isOnline(d);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={d.name} url={d.avatarUrl || undefined} />
                        <div className="leading-5">
                          <div className="font-medium">{d.name || "—"}</div>
                          {d.createdAt && (
                            <div className="text-xs text-muted-foreground">
                              Joined{" "}
                              {new Date(d.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{d.phone || "—"}</TableCell>
                    <TableCell>{vehicleText(d.vehicle)}</TableCell>
                    <TableCell>
                      <ApprovalPill status={d.status} />
                    </TableCell>
                    <TableCell>
                      <PresenceDot online={online} />
                    </TableCell>
                    <TableCell className="text-right">
                      {currency(d.earnings)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to={`/admin/drivers/${encodeURIComponent(
                            String(d.id)
                          )}`}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Page {page}
          {drivers.length > 0
            ? ` • ${drivers.length} row${drivers.length > 1 ? "s" : ""}`
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

function ApprovalPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "pending"
      ? "bg-accent text-accent-foreground ring-border"
      : "bg-muted text-foreground ring-border";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function PresenceDot({ online }: { online?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          online ? "bg-primary" : "bg-muted"
        }`}
        aria-hidden
      />
      <span className="text-xs text-muted-foreground">
        {online ? "Online" : "Offline"}
      </span>
    </span>
  );
}

function Avatar({ name, url }: { name?: string; url?: string }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  return (
    <UiAvatar className="h-10 w-10 ring-1 ring-border">
      <AvatarImage src={url} alt={name || "Driver"} />
      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
        {initials || "?"}
      </AvatarFallback>
    </UiAvatar>
  );
}
