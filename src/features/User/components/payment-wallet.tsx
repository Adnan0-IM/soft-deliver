import { useEffect, useState } from "react";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Wallet2 } from "lucide-react";

export type Wallet = {
  balance: number;
  currency: "NGN" | "USD" | "EUR" | "GBP";
};

const mockFetchWallet = async (): Promise<{ wallet: Wallet }> => {
  await new Promise((r) => setTimeout(r, 500));
  return { wallet: { balance: 25.5, currency: "NGN" } };
};

export function Wallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await mockFetchWallet();
        setWallet(data.wallet);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <UiCard className="mb-4">
      <CardHeader>
        <CardTitle className="flex gap-2">
          {" "}
          <Wallet2 size={24} /> <span className="text-base">Wallet</span>{" "}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3 p-4">
        {loading ? (
          <Spinner />
        ) : wallet ? (
          <div className="flex flex-col gap-4 justify-center sm:justify-between sm:flex-row w-full items-center text-sm sm:text-base">
            <div className="text-lg">
              Balance:{" "}
              <strong>
                {wallet.currency} {wallet.balance.toFixed(2)}
              </strong>
            </div>
            <div className="md:ml-auto flex  gap-2">
              <Button size="sm" disabled>
                Add Funds (soon)
              </Button>
              <Button size="sm" variant="secondary" disabled>
                Withdraw (soon)
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">No wallet found.</div>
        )}
      </CardContent>
    </UiCard>
  );
}
