import React, { useEffect, useMemo, useState } from "react";

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
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}>
      <h2>Payment</h2>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading…</div>}

      {/* Wallet */}
      {wallet && (
        <div
          style={{
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>Wallet</div>
          <div>
            Balance:{" "}
            <strong>
              {wallet.currency} {wallet.balance.toFixed(2)}
            </strong>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button disabled style={{ padding: "6px 10px" }}>
              Add Funds (coming soon)
            </button>
            <button disabled style={{ padding: "6px 10px" }}>
              Withdraw (coming soon)
            </button>
          </div>
        </div>
      )}

      {/* Saved cards */}
      <div
        style={{
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Saved Cards</div>
        {cards.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No cards saved.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {cards.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  border: "1px solid #f3f4f6",
                  borderRadius: 8,
                }}
              >
                <div style={{ textTransform: "capitalize" }}>{c.brand}</div>
                <div style={{ color: "#6b7280" }}>•••• {c.last4}</div>
                <div style={{ color: "#6b7280" }}>
                  Exp: {String(c.expMonth).padStart(2, "0")}/{c.expYear}
                </div>
                {c.default ? (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#d1fae5",
                      color: "#065f46",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                    }}
                  >
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => setDefaultCard(c.id)}
                    style={{ marginLeft: "auto", padding: "6px 10px" }}
                  >
                    Set Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new card */}
      <div
        style={{
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Add New Card</div>
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 120px 140px",
          }}
        >
          <input
            type="text"
            placeholder="Card number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            style={{ padding: 8 }}
          />
          <input
            type="number"
            placeholder="MM"
            min={1}
            max={12}
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value)}
            style={{ padding: 8 }}
          />
          <input
            type="number"
            placeholder="YYYY"
            value={expYear}
            onChange={(e) => setExpYear(e.target.value)}
            style={{ padding: 8 }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            onClick={handleAddCard}
            disabled={addCardDisabled}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            {adding ? "Adding..." : "Add Card"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          Test numbers: 4242 4242 4242 4242 (Visa), 5454 5454 5454 5454
          (Mastercard).
        </div>
      </div>

      {/* Payment logs */}
      <div
        style={{
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Payment Logs</div>
        {logs.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No payments found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Date</th>
                  <th style={{ padding: "8px 6px" }}>Description</th>
                  <th style={{ padding: "8px 6px" }}>Method</th>
                  <th style={{ padding: "8px 6px" }}>Amount</th>
                  <th style={{ padding: "8px 6px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .slice()
                  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                  .map((l) => (
                    <tr
                      key={l.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                        {new Date(l.date).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 6px" }}>{l.description}</td>
                      <td
                        style={{
                          padding: "10px 6px",
                          textTransform: "capitalize",
                        }}
                      >
                        {l.method}
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {l.currency} {l.amount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "10px 6px",
                          textTransform: "capitalize",
                        }}
                      >
                        {l.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
