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

type User = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  totalOrders?: number;
  status: "active" | "banned" | "new" | string;
  createdAt?: string;
  avatarUrl?: string | null;
};

type StatusFilter = "all" | "active" | "banned" | "new";

import { adminGetUsers } from "@/features/Admin/api";

export default function Users() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(h);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query, limit]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (query) params.set("q", query);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const data = await adminGetUsers({
          status: statusFilter === "all" ? undefined : statusFilter,
          q: query || undefined,
          page,
          limit,
        });

        let list: User[] = [];
        let total: number | undefined;
        let pageSize = limit;

        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === "object") {
          list = data.data ?? [];
          total = data.total;
          pageSize = data.pageSize ?? limit;
        }

        setUsers(list);
        setHasNext(
          typeof total === "number"
            ? page * pageSize < total
            : list.length === pageSize
        );
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") {
          setError((e as Error)?.message || "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [statusFilter, query, page, limit]);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    return users.length
      ? `Showing ${users.length}${hasNext ? "+" : ""}`
      : "No users found";
  }, [loading, users, hasNext]);

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email…"
          aria-label="Search users"
          className="h-9 w-72"
        />
      </header>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "secondary" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "secondary" : "outline"}
            onClick={() => setStatusFilter("active")}
            className="rounded-full"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "banned" ? "secondary" : "outline"}
            onClick={() => setStatusFilter("banned")}
            className="rounded-full"
          >
            Banned
          </Button>
          <Button
            variant={statusFilter === "new" ? "secondary" : "outline"}
            onClick={() => setStatusFilter("new")}
            className="rounded-full"
          >
            New
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
      </section>

      {/* Table */}
      <section className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Total orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} url={u.avatarUrl || undefined} />
                      <div className="grid">
                        <div className="font-medium">{u.name || "—"}</div>
                        {u.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.email ? (
                      <a
                        href={`mailto:${u.email}`}
                        className="text-primary hover:underline"
                      >
                        {u.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    {typeof u.totalOrders === "number" ? u.totalOrders : 0}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={u.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/users/${u.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </section>

      {/* Pagination */}
      <section className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Page {page}
          {users.length > 0
            ? ` • ${users.length} row${users.length > 1 ? "s" : ""}`
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
      </section>
    </div>
  );
}

/* UI helpers */

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "active"
      ? "bg-secondary text-secondary-foreground border border-border"
      : s === "banned"
      ? "bg-destructive/10 text-destructive border border-border"
      : s === "new"
      ? "bg-primary/10 text-primary border border-border"
      : "bg-muted text-foreground border border-border";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function Avatar({ name, url }: { name?: string; url?: string }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  return (
    <UiAvatar className="h-9 w-9 ring-1 ring-border">
      <AvatarImage src={url} alt={name || "User"} />
      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
        {initials || "?"}
      </AvatarFallback>
    </UiAvatar>
  );
}
