import { useEffect, useMemo, useState } from "react";
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Card = {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "other";
  last4: string;
  expMonth: number;
  expYear: number;
  default?: boolean;
};

type Wallet = {
  balance: number;
  currency: "USD" | "EUR" | "GBP";
};

type PaymentLog = {
  id: string;
  date: string; // ISO
  amount: number;
  currency: Wallet["currency"];
  method: "wallet" | "card";
  description: string;
  status: "success" | "failed" | "pending";
};

const mockFetchWallet = async (): Promise<{
  wallet: Wallet;
  cards: Card[];
  logs: PaymentLog[];
}> => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    wallet: { balance: 25.5, currency: "USD" },
    cards: [
      {
        id: "card_1",
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2026,
        default: true,
      },
      {
        id: "card_2",
        brand: "mastercard",
        last4: "5454",
        expMonth: 8,
        expYear: 2025,
      },
    ],
    logs: [
      {
        id: "pay_1",
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 8.75,
        currency: "USD",
        method: "card",
        description: "Ride to Airport T1",
        status: "success",
      },
      {
        id: "pay_2",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        amount: 12.0,
        currency: "USD",
        method: "wallet",
        description: "Delivery to Oak Rd",
        status: "success",
      },
    ],
  };
};

const mockAddCard = async (
  cardNumber: string,
  expMonth: number,
  expYear: number
) => {
  await new Promise((r) => setTimeout(r, 600));
  const last4 = cardNumber.slice(-4);
  return {
    id: `card_${Date.now()}`,
    brand: cardNumber.startsWith("4")
      ? "visa"
      : cardNumber.startsWith("5")
      ? "mastercard"
      : "other",
    last4,
    expMonth,
    expYear,
  } as Card;
};

const Payment: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add card form
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your API calls:
        // const res = await fetch('/user/wallet');
        // const data = await res.json();
        const data = await mockFetchWallet();
        setWallet(data.wallet);
        setCards(data.cards);
        setLogs(data.logs);
      } catch {
        setError("Failed to load payment info.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addCardDisabled = useMemo(() => {
    const num = cardNumber.replace(/\s+/g, "");
    const mm = Number(expMonth);
    const yy = Number(expYear);
    return (
      adding ||
      num.length < 12 ||
      Number.isNaN(mm) ||
      Number.isNaN(yy) ||
      mm < 1 ||
      mm > 12 ||
      yy < new Date().getFullYear()
    );
  }, [adding, cardNumber, expMonth, expYear]);

  const handleAddCard = async () => {
    setError(null);
    const num = cardNumber.replace(/\s+/g, "");
    const mm = Number(expMonth);
    const yy = Number(expYear);
    if (addCardDisabled) {
      setError("Please enter a valid card number and expiry.");
      return;
    }
    try {
      setAdding(true);
      // Replace with POST /user/add-card
      // await fetch('/user/add-card', { method: 'POST', body: JSON.stringify({ number: num, expMonth: mm, expYear: yy }) });
      const newCard = await mockAddCard(num, mm, yy);
      setCards((c) => [newCard, ...c]);
      setCardNumber("");
      setExpMonth("");
      setExpYear("");
    } catch {
      setError("Failed to add card.");
    } finally {
      setAdding(false);
    }
  };

  const setDefaultCard = (id: string) => {
    setCards((list) =>
      list.map((c) => ({
        ...c,
        default: c.id === id,
      }))
    );
    // In real app, call backend to persist default card selection.
  };

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-4">Payment</h2>

      {error && <div className="text-sm text-destructive mb-2">{error}</div>}
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {wallet && (
        <UICard className="mb-4">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="font-semibold">Wallet</div>
            <div>
              Balance:{" "}
              <strong>
                {wallet.currency} {wallet.balance.toFixed(2)}
              </strong>
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" disabled>
                Add Funds (soon)
              </Button>
              <Button size="sm" variant="secondary" disabled>
                Withdraw (soon)
              </Button>
            </div>
          </CardContent>
        </UICard>
      )}

      <UICard className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Saved Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="text-muted-foreground">No cards saved.</div>
          ) : (
            <div className="grid gap-2">
              {cards.map((c) => (
                <UICard key={c.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Badge variant="secondary" className="capitalize">
                      {c.brand}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      •••• {c.last4}
                    </div>
                    <div className="text-sm">
                      {String(c.expMonth).padStart(2, "0")}/{c.expYear}
                    </div>
                    {c.default ? (
                      <Badge className="ml-auto">Default</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="ml-auto"
                        variant="outline"
                        onClick={() => setDefaultCard(c.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </CardContent>
                </UICard>
              ))}
            </div>
          )}
        </CardContent>
      </UICard>

      <UICard className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add New Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-[1fr_120px_140px]">
            <Input
              placeholder="Card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <Input
              type="number"
              placeholder="MM"
              min={1}
              max={12}
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
            />
            <Input
              type="number"
              placeholder="YYYY"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <Button onClick={handleAddCard} disabled={addCardDisabled}>
              {adding ? "Adding..." : "Add Card"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Test numbers: 4242 4242 4242 4242 (Visa), 5454 5454 5454 5454
            (Mastercard).
          </div>
        </CardContent>
      </UICard>

      <UICard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payment Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-4 text-muted-foreground">No payments found.</div>
          ) : (
            <div className="w-full overflow-x-auto">
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
                      <TableCell className="truncate max-w-[320px]">
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
          )}
        </CardContent>
      </UICard>
    </div>
  );
};
export default Payment;
