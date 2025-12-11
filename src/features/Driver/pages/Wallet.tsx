import { useEffect, useState } from "react";
import { getDriverWallet, requestWithdraw } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WalletData = {
  balance: number;
  withdrawalHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: "pending" | "completed" | "failed";
  }>;
  earningsLogs: Array<{
    id: string;
    amount: number;
    source: string;
    date: string;
  }>;
};

const currency = (n: number | undefined) =>
  (typeof n === "number" ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

export default function Wallet() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getDriverWallet();
        if (!mounted) return;
        setData(res);
      } catch (e) {
        setError((e as Error)?.message || "Failed to load wallet.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onWithdraw = async () => {
    if (withdrawing) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (data && amt > data.balance) {
      setError("Amount exceeds available balance.");
      return;
    }
    setWithdrawing(true);
    setError(null);
    try {
      await requestWithdraw(amt);
      // Refresh wallet after withdraw request
      const res = await getDriverWallet();
      setData(res);
      setAmount("");
    } catch (e) {
      setError((e as Error)?.message || "Failed to request withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Wallet</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}

      {/* Balance + Withdraw */}
      <Card>
        <CardContent className="grid gap-3 py-4">
          <div>
            <h3 className="text-base font-semibold">Balance</h3>
            <p className="m-0 text-3xl font-bold">
              {loading ? "—" : currency(data?.balance)}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to withdraw"
            />
            <Button
              onClick={onWithdraw}
              disabled={withdrawing || loading}
              aria-busy={withdrawing}
            >
              {withdrawing ? "Requesting…" : "Withdraw"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Withdrawals may take up to 2–3 business days to process.
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal history */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !data?.withdrawalHistory?.length ? (
            <p className="text-sm text-muted-foreground">No withdrawals yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.withdrawalHistory.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{new Date(w.date).toLocaleString()}</TableCell>
                    <TableCell>{currency(w.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize"
                        variant={
                          w.status === "completed"
                            ? "secondary"
                            : w.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Earnings logs */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !data?.earningsLogs?.length ? (
            <p className="text-sm text-muted-foreground">No earnings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.earningsLogs.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.date).toLocaleString()}</TableCell>
                    <TableCell>{e.source}</TableCell>
                    <TableCell>{currency(e.amount)}</TableCell>
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
