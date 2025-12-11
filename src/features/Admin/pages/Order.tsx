import React, { useEffect, useMemo, useState } from "react";
import {
  adminAssignDriver,
  adminCancelOrder,
  adminGetOrder,
} from "@/features/Admin/api";
import { Link, useNavigate, useParams } from "react-router";

/* Types */

type MiniUser = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

type MiniDriver = {
  id: string | number;
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  vehicle?: string | null;
};

type Payment = {
  method?: string | null;
  status?: "paid" | "unpaid" | "refunded" | string;
  paidAt?: string | null;
  reference?: string | null;
  fee?: number | null;
  total?: number | null;
  currency?: string | null;
};

type Order = {
  id: string | number;
  type: "ride" | "delivery" | string;
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "delivered"
    | "completed"
    | "cancelled"
    | string;
  amount: number;
  currency?: string | null;

  user?: MiniUser | null;
  driver?: MiniDriver | null;

  pickup?: string | null;
  dropoff?: string | null;

  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;

  payment?: Payment | null;

  createdAt: string;
  updatedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null; // en route / in progress
  deliveredAt?: string | null; // for delivery
  completedAt?: string | null; // for ride or final state
  cancelledAt?: string | null;
};


const currency = (n?: number | null, c = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: c })
    : "-";

/* UI helpers */

function Pill({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ring-1 ring-border ${cls}`}
    >
      {children}
    </span>
  );
}

function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "completed" || s === "delivered"
      ? "bg-secondary text-secondary-foreground"
      : s === "assigned" || s === "in_progress" || s === "pending"
      ? "bg-accent text-accent-foreground"
      : s === "cancelled"
      ? "bg-destructive/10 text-destructive"
      : "bg-muted text-foreground";
  return <Pill cls={cls}>{status || "—"}</Pill>;
}

function TypePill({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();
  const cls =
    t === "ride"
      ? "bg-primary/10 text-primary"
      : t === "delivery"
      ? "bg-secondary text-secondary-foreground"
      : "bg-muted text-foreground";
  return <Pill cls={`capitalize ${cls}`}>{type || "—"}</Pill>;
}

function Avatar({
  name,
  url,
  size = 40,
}: {
  name?: string | null;
  url?: string | null;
  size?: number;
}) {
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
  const box = { width: size, height: size };
  return url ? (
    <img
      src={url}
      alt={name || "Avatar"}
      className="rounded-full object-cover ring-1 ring-border"
      style={box}
    />
  ) : (
    <div
      className="rounded-full bg-accent text-accent-foreground grid place-items-center font-bold ring-1 ring-border"
      style={box}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Assign driver modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [driverIdInput, setDriverIdInput] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetOrder(id);
        const o =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data && typeof data === "object" && "order" in (data as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? ((data as any).order as Order)
            : (data as Order);
        setOrder(o);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const timeline = useMemo(() => {
    const t: { label: string; at?: string | null }[] = [
      { label: "Requested", at: order?.createdAt },
      { label: "Driver assigned", at: order?.assignedAt },
      { label: "On the way", at: order?.startedAt },
      { label: "Completed", at: order?.completedAt || order?.deliveredAt },
    ];
    if ((order?.status || "").toLowerCase() === "cancelled") {
      t.push({
        label: "Cancelled",
        at: order?.cancelledAt || order?.updatedAt || undefined,
      });
    }
    return t;
  }, [order]);

  async function cancelOrder() {
    if (!order) return;
    if (!confirm("Cancel this order?")) return;
    try {
      setActionBusy(true);
      setNotice(null);
      await adminCancelOrder(order.id);
      setOrder({
        ...order,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
      setNotice("Order cancelled.");
    } catch (e) {
      setError((e as Error)?.message || "Cancel failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function assignDriver(e?: React.FormEvent) {
    e?.preventDefault();
    if (!order || !driverIdInput.trim()) return;
    try {
      setActionBusy(true);
      setNotice(null);
      const bodyId = driverIdInput.trim();
      await adminAssignDriver(order.id, bodyId);
      // Optimistic update
      setOrder({
        ...order,
        status:
          (order.status || "").toLowerCase() === "pending"
            ? "assigned"
            : order.status,
        driver: { id: bodyId, name: `#${bodyId}` },
        assignedAt: order.assignedAt || new Date().toISOString(),
      });
      setAssignOpen(false);
      setDriverIdInput("");
      setNotice("Driver assigned.");
    } catch (e) {
      setError((e as Error)?.message || "Assign failed");
    } finally {
      setActionBusy(false);
    }
  }

  const pay = order?.payment;
  const amountCcy = order?.currency || pay?.currency || "USD";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold">Order #{order?.id || id}</h1>
        </div>
        {loading ? (
          <span className="text-muted-foreground">Loading…</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : order ? (
          <div className="flex items-center gap-2">
            <TypePill type={order.type} />
            <StatusPill status={order.status} />
          </div>
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

      {/* Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-card ring-1 ring-border rounded-lg p-5">
          <div className="text-sm text-gray-600">Amount</div>
          <div className="text-xl font-semibold">
            {currency(order?.amount, amountCcy || "USD")}
          </div>
        </div>
        <div className="bg-card ring-1 ring-border rounded-lg p-5">
          <div className="text-sm text-gray-600">Created</div>
          <div className="text-base">
            {order?.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "—"}
          </div>
        </div>
        <div className="bg-card ring-1 ring-border rounded-lg p-5">
          <div className="text-sm text-gray-600">Updated</div>
          <div className="text-base">
            {order?.updatedAt
              ? new Date(order.updatedAt).toLocaleString()
              : "—"}
          </div>
        </div>
      </section>

      {/* Route / Map */}
      <section className="bg-card ring-1 ring-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold">Route</h2>
          {order?.pickup || order?.dropoff ? (
            <span className="text-xs text-muted-foreground">
              Pickup and drop-off
            </span>
          ) : null}
        </div>
        <div className="grid md:grid-cols-2">
          <div className="p-5 space-y-2 text-sm">
            <div>
              <div className="text-muted-foreground">Pickup</div>
              <div className="font-medium">{order?.pickup || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Drop-off</div>
              <div className="font-medium">{order?.dropoff || "—"}</div>
            </div>
            {(order?.pickupLat && order?.pickupLng) ||
            (order?.dropoffLat && order?.dropoffLng) ? (
              <div className="text-xs text-muted-foreground">
                {order?.pickupLat && order?.pickupLng ? (
                  <div>
                    Pickup coords: {order.pickupLat}, {order.pickupLng}
                  </div>
                ) : null}
                {order?.dropoffLat && order?.dropoffLng ? (
                  <div>
                    Drop-off coords: {order.dropoffLat}, {order.dropoffLng}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="min-h-[220px] bg-muted flex items-center justify-center text-muted-foreground">
            Map preview
          </div>
        </div>
      </section>

      {/* Parties */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Customer */}
        <div className="bg-card ring-1 ring-border rounded-lg p-5">
          <h2 className="text-base font-semibold mb-3">Customer</h2>
          {loading ? (
            <div className="h-14 animate-pulse" />
          ) : order?.user ? (
            <div className="flex items-center gap-3">
              <Avatar name={order.user.name} url={order.user.avatarUrl} />
              <div>
                <div className="font-medium">{order.user.name || "—"}</div>
                <div className="text-sm text-muted-foreground">
                  {order.user.email ? (
                    <a
                      className="text-indigo-600 hover:underline"
                      href={`mailto:${order.user.email}`}
                    >
                      {order.user.email}
                    </a>
                  ) : (
                    "—"
                  )}
                  {order.user.phone ? (
                    <span className="ml-2">• {order.user.phone}</span>
                  ) : null}
                </div>
                <Link
                  to={`/admin/users/${encodeURIComponent(
                    String(order.user.id)
                  )}`}
                  className="text-xs text-primary hover:underline"
                >
                  View profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No customer info.
            </div>
          )}
        </div>

        {/* Driver */}
        <div className="bg-card ring-1 ring-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Driver</h2>
            <button
              onClick={() => setAssignOpen(true)}
              className="text-sm rounded border border-border px-3 py-1.5 hover:bg-muted"
            >
              Assign driver
            </button>
          </div>
          {loading ? (
            <div className="h-14 animate-pulse" />
          ) : order?.driver ? (
            <div className="flex items-center gap-3">
              <Avatar name={order.driver.name} url={order.driver.avatarUrl} />
              <div>
                <div className="font-medium">{order.driver.name || "—"}</div>
                <div className="text-sm text-muted-foreground">
                  {order.driver.phone || "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.driver.vehicle || ""}
                </div>
                <Link
                  to={`/admin/drivers/${encodeURIComponent(
                    String(order.driver.id)
                  )}`}
                  className="text-xs text-primary hover:underline"
                >
                  View driver
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No driver assigned.
            </div>
          )}
        </div>
      </section>

      {/* Payment */}
      <section className="bg-card ring-1 ring-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-3">Payment</h2>
        {loading ? (
          <div className="h-10 animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 text-sm">
            <div>
              <div className="text-muted-foreground">Method</div>
              <div className="font-medium capitalize">{pay?.method || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{pay?.status || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Paid at</div>
              <div className="font-medium">
                {pay?.paidAt ? new Date(pay.paidAt).toLocaleString() : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Reference</div>
              <div className="font-medium">{pay?.reference || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Subtotal</div>
              <div className="font-medium">
                {currency(order?.amount, amountCcy)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Fee</div>
              <div className="font-medium">
                {currency(pay?.fee ?? 0, amountCcy)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-medium">
                {currency(
                  typeof pay?.total === "number"
                    ? pay?.total
                    : (order?.amount ?? 0) + (pay?.fee ?? 0),
                  amountCcy
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="bg-card ring-1 ring-border rounded-lg p-5">
        <h2 className="text-base font-semibold mb-3">Timeline</h2>
        {loading ? (
          <div className="h-16 animate-pulse" />
        ) : (
          <ol className="relative border-l border-border pl-4">
            {timeline.map((ev, i) => (
              <li key={i} className="mb-4 ml-2">
                <span className="absolute -left-1.5 mt-1 flex h-3 w-3">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                </span>
                <div className="font-medium">{ev.label}</div>
                <div className="text-xs text-muted-foreground">
                  {ev.at ? new Date(ev.at).toLocaleString() : "—"}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Admin actions */}
      <section className="flex flex-wrap gap-2">
        <button
          onClick={() => setAssignOpen(true)}
          disabled={actionBusy || loading}
          className="px-3 py-2 text-sm rounded border border-border bg-card hover:bg-muted disabled:opacity-50"
        >
          Assign driver manually
        </button>
        <button
          onClick={cancelOrder}
          disabled={
            actionBusy ||
            loading ||
            (order?.status || "").toLowerCase() === "cancelled"
          }
          className="px-3 py-2 text-sm rounded border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          Cancel order
        </button>
      </section>

      {/* Assign driver modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Assign driver</h3>
              <button
                onClick={() => setAssignOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <form onSubmit={assignDriver} className="space-y-3">
              <div className="text-sm text-gray-700">
                Enter a driver ID to assign to order #{order?.id}.
              </div>
              <input
                value={driverIdInput}
                onChange={(e) => setDriverIdInput(e.target.value)}
                placeholder="Driver ID"
                className="w-full h-9 rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignOpen(false)}
                  className="px-3 py-1.5 text-sm rounded border border-border bg-card hover:bg-muted"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!driverIdInput.trim() || actionBusy}
                  className="px-3 py-1.5 text-sm rounded border border-primary bg-primary text-primary-foreground disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
