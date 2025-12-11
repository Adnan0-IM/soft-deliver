import { useState } from "react";
import { useNavigate } from "react-router";
import { acceptJob, rejectJob } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      className="fixed inset-0 bg-black/35 grid place-items-center z-50"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] sm:w-[520px] shadow-xl"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New Job Request</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid gap-2 text-sm">
            <div>
              <span className="font-semibold">Pickup:</span>{" "}
              {job.pickupAddress ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Drop-off:</span>{" "}
              {job.dropoffAddress ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Estimated earnings:</span>{" "}
              {typeof job.price === "number" ? `$${job.price.toFixed(2)}` : "—"}
            </div>
            <div>
              <span className="font-semibold">Distance:</span>{" "}
              {typeof job.distanceKm === "number"
                ? `${job.distanceKm} km`
                : "—"}
            </div>
            <div>
              <span className="font-semibold">Time estimate:</span>{" "}
              {typeof job.timeEstimateMins === "number"
                ? `${job.timeEstimateMins} min`
                : "—"}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onAccept} disabled={busy} aria-busy={busy}>
              {busy ? "Processing…" : "Accept"}
            </Button>
            <Button onClick={onReject} disabled={busy} variant="outline">
              Reject
            </Button>
            <Button
              onClick={onClose}
              disabled={busy}
              variant="outline"
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
