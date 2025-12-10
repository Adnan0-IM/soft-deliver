import { useState } from "react";
import { useNavigate } from "react-router";
import { acceptJob, rejectJob } from "../api";

export type JobRequest = {
  id: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  price?: number;
  distanceKm?: number;
  timeEstimateMins?: number;
};

type Props = {
  job: JobRequest;
  onClose: () => void;
};

export default function JobModal({ job, onClose }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAccept = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await acceptJob(job.id);
      navigate(`/driver/job/${job.id}`);
    } catch (e) {
      setError((e as Error)?.message || "Failed to accept job.");
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await rejectJob(job.id);
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Failed to reject job.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 95vw)",
          background: "white",
          borderRadius: 10,
          boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>New Job Request</h3>

        {error && (
          <div
            style={{
              padding: 10,
              background: "#ffe5e5",
              color: "#a40000",
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <strong>Pickup:</strong> {job.pickupAddress ?? "—"}
          </div>
          <div>
            <strong>Drop-off:</strong> {job.dropoffAddress ?? "—"}
          </div>
          <div>
            <strong>Estimated earnings:</strong>{" "}
            {typeof job.price === "number" ? `$${job.price.toFixed(2)}` : "—"}
          </div>
          <div>
            <strong>Distance:</strong>{" "}
            {typeof job.distanceKm === "number" ? `${job.distanceKm} km` : "—"}
          </div>
          <div>
            <strong>Time estimate:</strong>{" "}
            {typeof job.timeEstimateMins === "number"
              ? `${job.timeEstimateMins} min`
              : "—"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            onClick={onAccept}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#111827",
              color: "white",
              cursor: busy ? "not-allowed" : "pointer",
            }}
            aria-busy={busy}
          >
            {busy ? "Processing…" : "Accept"}
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#111827",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Reject
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#111827",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
