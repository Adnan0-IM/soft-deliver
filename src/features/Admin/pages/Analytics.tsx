import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  adminGetAnalyticsOrders,
  adminGetAnalyticsEarnings,
  adminGetAnalyticsUsers,
  adminGetAnalyticsDrivers,
  type OrdersPoint,
  type EarningsPoint,
  type UsersPoint,
  type DriverPoint,
} from "@/features/Admin/api";

type Range = "7d" | "30d" | "90d";

const currencyFmt = (n?: number | null, c = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: c })
    : "-";

function CardSection({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<Range>("7d");

  const [orders, setOrders] = useState<OrdersPoint[]>([]);
  const [earnings, setEarnings] = useState<EarningsPoint[]>([]);
  const [users, setUsers] = useState<UsersPoint[]>([]);
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [o, e, u] = await Promise.all([
          adminGetAnalyticsOrders({ range }),
          adminGetAnalyticsEarnings({ range }),
          adminGetAnalyticsUsers({ range }),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getArr = <T,>(r: any, keys: string[]): T[] => {
          if (Array.isArray(r)) return r as T[];
          for (const k of keys) {
            const v = r?.[k];
            if (Array.isArray(v)) return v as T[];
          }
          return [];
        };

        setOrders(getArr<OrdersPoint>(o, ["data", "orders"]));
        setEarnings(getArr<EarningsPoint>(e, ["data", "earnings"]));
        setUsers(getArr<UsersPoint>(u, ["data", "users"]));

        // Optional driver activity endpoint; ignore failures
        try {
          const d = await adminGetAnalyticsDrivers({ range });
          setDrivers(getArr<DriverPoint>(d, ["data", "drivers"]));
        } catch {
          setDrivers([]);
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError")
          setError((err as Error)?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [range]);

  const earningsCurrency = useMemo(
    () => earnings.find((x) => x.currency)?.currency || "USD",
    [earnings]
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Range:</span>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 ring-1 ring-border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSection title="Orders per day">
          {loading ? (
            <div className="h-48 grid place-items-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Orders"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardSection>

        <CardSection title="Earnings per week">
          {loading ? (
            <div className="h-48 grid place-items-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis
                    tickFormatter={(v) =>
                      currencyFmt(v as number, earningsCurrency)
                    }
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) =>
                      currencyFmt(v as number, earningsCurrency)
                    }
                  />
                  <Legend />
                  <Bar dataKey="total" name="Earnings" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardSection>

        <CardSection title="New users per month">
          {loading ? (
            <div className="h-48 grid place-items-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={users}>
                  <defs>
                    <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="New users"
                    stroke="#6366f1"
                    fill="url(#usersFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardSection>

        <CardSection
          title="Driver activity"
          right={
            <span className="text-xs text-muted-foreground">
              Online/active counts
            </span>
          }
        >
          {loading ? (
            <div className="h-48 grid place-items-center text-muted-foreground">
              Loading…
            </div>
          ) : drivers.length === 0 ? (
            <div className="h-48 grid place-items-center text-muted-foreground">
              No driver activity data
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={drivers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="online"
                    name="Online drivers"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    name="Active on jobs"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardSection>
      </div>

      {/* Optional: Heatmap/Top areas placeholder */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">High-demand pickup areas</CardTitle>
          <span className="text-xs text-muted-foreground">Optional</span>
        </CardHeader>
        <CardContent>
          <div className="min-h-40 grid place-items-center text-muted-foreground">
            Add a heatmap here (Mapbox/Leaflet) or list top pickup areas from
            your analytics API.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
