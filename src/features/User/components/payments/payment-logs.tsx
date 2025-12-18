import { useEffect, useState } from "react";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type PaymentLog = {
  id: string;
  date: string; // ISO
  amount: number;
  currency: "NGN" | "USD" | "EUR" | "GBP";
  method: "wallet" | "card";
  description: string;
  status: "success" | "failed" | "pending";
};

const mockFetchLogs = async (): Promise<{ logs: PaymentLog[] }> => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    logs: [
      {
        id: "pay_1",
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 8.75,
        currency: "NGN",
        method: "card",
        description: "Ride to Airport T1",
        status: "success",
      },
      {
        id: "pay_2",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        amount: 12.0,
        currency: "NGN",
        method: "wallet",
        description: "Delivery to Oak Rd",
        status: "success",
      },
    ],
  };
};

export function Logs() {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await mockFetchLogs();
        setLogs(data.logs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <UiCard className="p-4">
      <CardHeader>
        <CardTitle className="text-base">Payment Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <div className="p-4 text-muted-foreground">No payments found.</div>
        ) : (
          <>
            {/* Mobile list */}
            <div className="md:hidden grid gap-2 p-2 pt-0">
              {logs.map((l) => (
                <UiCard key={l.id}>
                  <CardContent className="p-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium">
                        {l.currency} {l.amount.toFixed(2)}
                      </div>
                      <Badge
                        variant={
                          l.status === "success"
                            ? "default"
                            : l.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {l.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {new Date(l.date).toLocaleString()}
                    </div>
                    <div className="mt-1 capitalize">{l.method}</div>
                    <div className="mt-1 truncate">{l.description}</div>
                  </CardContent>
                </UiCard>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{new Date(l.date).toLocaleString()}</TableCell>
                      <TableCell>
                        {l.currency} {l.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">{l.method}</TableCell>
                      <TableCell className="truncate max-w-xs">
                        {l.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            l.status === "success"
                              ? "default"
                              : l.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </UiCard>
  );
}
