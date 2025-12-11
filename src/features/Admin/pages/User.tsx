import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar as UiAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type User = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  totalOrders?: number;
  status: "active" | "banned" | "new" | string;
  createdAt?: string;
  avatarUrl?: string | null;
  address?: string | null;
};

type Order = {
  id: string | number;
  amount: number;
  status: "pending" | "assigned" | "delivered" | "cancelled" | string;
  driverName?: string | null;
  createdAt: string;
};


import {
  adminGetUser,
  adminBanUser,
  adminUnbanUser,
  adminResetUserPassword,
} from "@/features/Admin/api";

const currency = (n?: number | null, ccy = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: ccy })
    : "-";

function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "active"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "banned"
      ? "bg-destructive/10 text-destructive ring-border"
      : "bg-primary/10 text-primary ring-border";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function Avatar({ name, url }: { name?: string; url?: string | null }) {
  const initials = useMemo(
    () =>
      (name || "?")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .slice(0, 2)
        .join(""),
    [name]
  );
  return (
    <UiAvatar className="h-14 w-14">
      <AvatarImage src={url || undefined} alt={name || "User"} />
      <AvatarFallback className="bg-accent text-accent-foreground font-bold">
        {initials || "?"}
      </AvatarFallback>
    </UiAvatar>
  );
}

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetUser(id);
        if ("user" in (data)) {
          setUser((data).user);
          setOrders((data).orders ?? []);
        } else {
          setUser(data as User);
          // If orders are nested on the user, pick them up
        ;
        }
      } catch (e) {
        setError((e as Error)?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : undefined;

  async function toggleBan() {
    if (!user) return;
    const isBanned = (user.status || "").toLowerCase() === "banned";
    if (!confirm(isBanned ? "Enable this account?" : "Disable this account?"))
      return;

    const prev = user.status;
    try {
      setActionBusy(true);
      setNotice(null);
      setUser({ ...user, status: isBanned ? "active" : "banned" }); // optimistic
      if (isBanned) {
        await adminUnbanUser(user.id);
      } else {
        await adminBanUser(user.id);
      }
      setNotice(isBanned ? "Account enabled." : "Account disabled.");
    } catch (e) {
      setUser({ ...user, status: prev });
      setError((e as Error)?.message || "Action failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function resetPassword() {
    if (!user) return;
    if (!confirm("Send password reset to this user?")) return;
    try {
      setActionBusy(true);
      setNotice(null);
      await adminResetUserPassword(user.id);
      setNotice("Password reset initiated.");
    } catch (e) {
      setError((e as Error)?.message || "Reset failed");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold">User</h1>
        </div>
        {loading ? (
          <span className="text-muted-foreground">Loading…</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : user ? (
          <StatusPill status={user.status} />
        ) : null}
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

      {/* User info panel */}
      <Card>
        <CardContent className="p-5">
          {loading ? (
            <div className="animate-pulse h-20" />
          ) : user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={user.name} url={user.avatarUrl} />
                <div>
                  <div className="text-lg font-semibold">
                    {user.name || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <a
                      className="text-indigo-600 hover:underline"
                      href={`mailto:${user.email}`}
                    >
                      {user.email}
                    </a>
                    {user.phone ? (
                      <span className="ml-2">• {user.phone}</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {joined ? `Joined ${joined}` : null}
                    {typeof user.totalOrders === "number" ? (
                      <span className="ml-2">• {user.totalOrders} orders</span>
                    ) : null}
                  </div>
                  {user.address ? (
                    <div className="text-xs text-muted-foreground mt-1">
                      {user.address}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleBan}
                  disabled={actionBusy}
                  className={
                    (user.status || "").toLowerCase() === "banned"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : undefined
                  }
                  variant={
                    (user.status || "").toLowerCase() === "banned"
                      ? "default"
                      : "outline"
                  }
                >
                  {(user.status || "").toLowerCase() === "banned"
                    ? "Enable account"
                    : "Disable account"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetPassword}
                  disabled={actionBusy}
                >
                  Reset password
                </Button>
                <Button asChild variant="outline">
                  <Link
                    to={`/admin/orders?userId=${encodeURIComponent(
                      String(user.id)
                    )}`}
                  >
                    View full history
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">User not found.</div>
          )}
        </CardContent>
      </Card>

      {/* Order history */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent orders</CardTitle>
          <Button asChild variant="link" className="h-auto p-0">
            <Link
              to={`/admin/orders?userId=${encodeURIComponent(
                String(user?.id ?? "")
              )}`}
            >
              View all
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">ID</TableHead>
                <TableHead className="text-left">Driver</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No orders
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.driverName || "—"}</TableCell>
                    <TableCell className="text-right">
                      {currency(o.amount)}
                    </TableCell>
                    <TableCell>
                      <OrderStatus status={o.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(o.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderStatus({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "delivered"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "assigned" || s === "pending"
      ? "bg-accent text-accent-foreground ring-border"
      : s === "cancelled"
      ? "bg-destructive/10 text-destructive ring-border"
      : "bg-muted text-foreground ring-border";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {status || "—"}
    </span>
  );
}
