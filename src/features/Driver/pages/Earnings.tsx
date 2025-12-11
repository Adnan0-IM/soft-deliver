import { useEffect, useMemo, useState } from "react";
import { getDriverEarnings } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EarningsSummary = {
  today: number;
  weekTotal: number;
  total: number;
  pendingPayout: number;
  completedPayouts: Array<{ id: string; amount: number; date: string }>;
  weeklyChart?: Array<{ date: string; amount: number }>; // last 7 days
};

const currency = (n: number | undefined) =>
  (typeof n === "number" ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

export default function Earnings() {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getDriverEarnings();
        if (!mounted) return;
        setData(res);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load earnings.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const weekly = useMemo(() => data?.weeklyChart ?? [], [data]);

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Earnings</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today’s Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : currency(data?.today)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : currency(data?.weekTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : currency(data?.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : currency(data?.pendingPayout)}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Weekly chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : weekly.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chart data.</p>
          ) : (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${weekly.length}, minmax(0,1fr))`,
              }}
            >
              {weekly.map((d) => (
                <div key={d.date} className="text-center">
                  <div
                    title={`${new Date(
                      d.date
                    ).toLocaleDateString()}: ${currency(d.amount)}`}
                    className="mx-auto w-3 rounded bg-primary"
                    style={{
                      height:
                        Math.max(8, Math.min(120, Math.round(d.amount))) + "px",
                    }}
                  />
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(d.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            (Optional: replace with Chart.js or Recharts.)
          </div>
        </CardContent>
      </Card>

      {/* Completed payout history */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : data?.completedPayouts?.length ? (
            <ul className="list-disc pl-5">
              {data.completedPayouts.map((p) => (
                <li key={p.id} className="mb-1">
                  {new Date(p.date).toLocaleString()} — {currency(p.amount)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No completed payouts.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
