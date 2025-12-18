import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard } from "lucide-react";

type Card = {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "other";
  last4: string;
  expMonth: number;
  expYear: number;
  default?: boolean;
};

const mockFetchCards = async (): Promise<{ cards: Card[] }> => {
  await new Promise((r) => setTimeout(r, 500));
  return {
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
  };
};

const mockAddCard = async (
  cardNumber: string,
  expMonth: number,
  expYear: number,
): Promise<Card> => {
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
  };
};

export function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add card form
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");

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

  const handleLoadCards = async () => {
    try {
      setLoading(true);
      const data = await mockFetchCards();
      setCards(data.cards);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadCards();
  }, []);

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
      })),
    );
    // Persist default selection to backend in real app.
  };

  return (
    <>
      <UiCard className="mb-4">
        <CardHeader className="">
          <CardTitle className="flex gap-2">
            <CreditCard size={24} />
            <span className="text-base">Saved Cards</span>{" "}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner />
          ) : cards.length === 0 ? (
            <div className="text-muted-foreground">No cards saved.</div>
          ) : (
            <div className="grid gap-2">
              {cards.map((c) => (
                <UiCard key={c.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-3">
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
                </UiCard>
              ))}
            </div>
          )}
        </CardContent>
      </UiCard>

      <UiCard className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Add New Card</CardTitle>
        </CardHeader>
        {error && <div className="text-sm text-red-600 px-4">{error}</div>}
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
            Example: 4242 4242 4242 4242 (Visa), 5454 5454 5454 5454
            (Mastercard).
          </div>
        </CardContent>
      </UiCard>
    </>
  );
}
