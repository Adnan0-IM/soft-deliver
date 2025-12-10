import { useEffect, useState } from "react";
import { getDriverWallet, requestWithdraw } from "../api";

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
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Wallet</h2>

      {error && (
        <div
          style={{
            padding: 12,
            background: "#ffe5e5",
            color: "#a40000",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* Balance + Withdraw */}
      <section
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <div>
          <h3 style={{ marginTop: 0 }}>Balance</h3>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            {loading ? "—" : currency(data?.balance)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to withdraw"
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          />
          <button
            onClick={onWithdraw}
            disabled={withdrawing || loading}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#111827",
              color: "white",
              cursor: withdrawing ? "not-allowed" : "pointer",
            }}
            aria-busy={withdrawing}
          >
            {withdrawing ? "Requesting…" : "Withdraw"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Withdrawals may take up to 2–3 business days to process.
        </div>
      </section>

      {/* Withdrawal history */}
      <section
        style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
      >
        <h3 style={{ marginTop: 0 }}>Withdrawal History</h3>
        {loading ? (
          <p>Loading…</p>
        ) : !data?.withdrawalHistory?.length ? (
          <p style={{ color: "#6b7280" }}>No withdrawals yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.withdrawalHistory.map((w) => (
                <tr key={w.id}>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {new Date(w.date).toLocaleString()}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {currency(w.amount)}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {w.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Earnings logs */}
      <section
        style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}
      >
        <h3 style={{ marginTop: 0 }}>Earnings Logs</h3>
        {loading ? (
          <p>Loading…</p>
        ) : !data?.earningsLogs?.length ? (
          <p style={{ color: "#6b7280" }}>No earnings yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Source
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.earningsLogs.map((e) => (
                <tr key={e.id}>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {new Date(e.date).toLocaleString()}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {e.source}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}
                  >
                    {currency(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
