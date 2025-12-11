/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Stats = {
  totalUsers: number;
  totalDrivers: number;
  ordersToday: number;
  activeDrivers?: number;
  pendingPayouts?: number;
};

type Order = {
  id: string | number;
  customerName: string;
  driverName?: string | null;
  amount: number;
  status: "pending" | "assigned" | "delivered" | "cancelled" | string;
  createdAt: string; // ISO date
};

type Driver = {
  id: string | number;
  name: string;
  status: "online" | "offline" | "busy" | string;
  lastActiveAt?: string;
};

const currency = (n: number | undefined | null, currency = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency })
    : "-";

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

import {
  adminGetStats,
  adminGetRecentOrders,
  adminGetActiveDrivers,
} from "@/features/Admin/api";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [s, ro, ad] = await Promise.all([
          adminGetStats(),
          adminGetRecentOrders(),
          adminGetActiveDrivers(),
        ]);
        setStats(s);
        const normalizedOrders = Array.isArray(ro)
          ? (ro as Order[])
          : ro && typeof ro === "object" && Array.isArray((ro as any).data)
          ? ((ro as any).data as Order[])
          : ro && typeof ro === "object" && Array.isArray((ro as any).orders)
          ? ((ro as any).orders as Order[])
          : [];
        setRecentOrders(normalizedOrders);
        const normalizedDrivers = Array.isArray(ad)
          ? (ad as Driver[])
          : ad && typeof ad === "object" && Array.isArray((ad as any).data)
          ? ((ad as any).data as Driver[])
          : [];
        setActiveDrivers(normalizedDrivers);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const daily = useMemo(() => computeDaily(recentOrders, 7), [recentOrders]);
  const activeDriversCount = stats?.activeDrivers ?? activeDrivers.length ?? 0;
  const pendingPayouts = stats?.pendingPayouts ?? 0;

  return (
    <div className="p-6 grid gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        {loading && <span className="text-muted-foreground">Loading…</span>}
        {error && <span className="text-destructive">{error}</span>}
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <SummaryCard label="Total users" value={stats?.totalUsers} />
        <SummaryCard label="Total drivers" value={stats?.totalDrivers} />
        <SummaryCard label="Orders today" value={stats?.ordersToday} />
        <SummaryCard label="Active drivers" value={activeDriversCount} />
        <SummaryCard label="Pending payouts" value={currency(pendingPayouts)} />
      </section>

      {/* Chart: Orders vs Earnings (last 7 days, from recent orders only) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            Orders vs Earnings (last 7 days)
          </CardTitle>
          <Legend />
        </CardHeader>
        <CardContent>
          <MiniBarChart data={daily} />
        </CardContent>
      </Card>

      {/* Recent orders table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent orders</CardTitle>
          <Link
            to="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg ring-1 ring-border">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-muted">
                <tr>
                  <Th>ID</Th>
                  <Th>Customer</Th>
                  <Th>Driver</Th>
                  <Th align="right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-muted-foreground"
                    >
                      {loading ? "Loading…" : "No recent orders"}
                    </td>
                  </tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <Td>{o.id}</Td>
                    <Td>{o.customerName}</Td>
                    <Td>{o.driverName || "—"}</Td>
                    <Td align="right">{currency(o.amount)}</Td>
                    <Td>
                      <StatusPill status={o.status} />
                    </Td>
                    <Td>{formatDate(o.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// UI bits

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value ?? "—"}</div>
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const ta =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";
  return (
    <th
      className={`px-4 py-2 text-xs text-muted-foreground font-medium border-b border-border ${ta}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const ta =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";
  return <td className={`px-4 py-2 align-middle ${ta}`}>{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "delivered"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "assigned" || s === "pending"
      ? "bg-primary/10 text-primary ring-border"
      : s === "cancelled"
      ? "bg-destructive/10 text-destructive ring-border"
      : "bg-muted text-foreground ring-border";
  return <Badge className={`capitalize ${cls}`}>{status}</Badge>;
}

function Legend() {
  return (
    <div className="flex gap-3 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-2.5 bg-blue-500" />
        Orders
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-2.5 bg-emerald-500" />
        Earnings
      </span>
    </div>
  );
}

// Lightweight bar chart without external deps
function MiniBarChart({
  data,
  height = 180,
}: {
  data: { date: string; label: string; orders: number; earnings: number }[];
  height?: number;
}) {
  const maxOrders = Math.max(1, ...data.map((d) => d.orders));
  const maxEarnings = Math.max(1, ...data.map((d) => d.earnings));

  return (
    <div className="bg-card ring-1 ring-border rounded-lg p-3">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${data.length || 1}, minmax(0, 1fr))`,
          height,
        }}
      >
        {data.map((d) => {
          const barsArea = height - 40;
          const ordersH = (d.orders / maxOrders) * barsArea;
          const earnH = (d.earnings / maxEarnings) * barsArea;
          return (
            <div key={d.date} className="flex flex-col justify-end">
              <div
                className="relative flex items-end"
                style={{ height: barsArea }}
              >
                <div
                  title={`${d.orders} orders`}
                  className="w-3 rounded bg-primary mr-1"
                  style={{ height: Math.max(4, ordersH) }}
                />
                <div
                  title={`${currency(d.earnings)} earnings`}
                  className="w-3 rounded bg-secondary ml-1"
                  style={{ height: Math.max(4, earnH) }}
                />
              </div>
              <div className="text-center text-[11px] text-muted-foreground mt-1">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Data helpers

function computeDaily(orders: Order[], days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const buckets: { [date: string]: { orders: number; earnings: number } } = {};
  const out: {
    date: string;
    label: string;
    orders: number;
    earnings: number;
  }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { orders: 0, earnings: 0 };
    out.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      orders: 0,
      earnings: 0,
    });
  }

  for (const o of orders) {
    if (!o?.createdAt) continue;
    const d = new Date(o.createdAt as unknown as string);
    const time = d.getTime();
    if (Number.isNaN(time)) continue; // skip invalid dates
    const key = d.toISOString().slice(0, 10);
    if (buckets[key]) {
      buckets[key].orders += 1;
      buckets[key].earnings += o.amount || 0;
    }
  }

  for (const row of out) {
    row.orders = buckets[row.date]?.orders ?? 0;
    row.earnings = buckets[row.date]?.earnings ?? 0;
  }

  return out;
}
