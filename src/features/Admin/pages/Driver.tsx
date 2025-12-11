import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Avatar as UiAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  adminApproveDriver,
  adminDisableDriver,
  adminGetDriver,
  adminResetDriverPassword,
} from "@/features/Admin/api";

type Vehicle =
  | string
  | {
      make?: string | null;
      model?: string | null;
      plate?: string | null;
      color?: string | null;
      year?: number | null;
    }
  | null;

type Driver = {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  status: "approved" | "pending" | "disabled" | string;
  presence?: "online" | "offline";
  online?: boolean;
  createdAt?: string;
  earnings?: number;
  totalCompleted?: number;
  vehicle?: Vehicle;
  licenseNumber?: string | null;
  licenseDocumentUrl?: string | null;
  address?: string | null;
};

type Job = {
  id: string | number;
  amount: number;
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "delivered"
    | "completed"
    | "cancelled"
    | string;
  customerName?: string | null;
  createdAt: string;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
};



const currency = (n?: number | null, ccy = "USD") =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: ccy })
    : "-";

const isOnline = (d?: Driver | null) =>
  !!d &&
  (typeof d.online === "boolean"
    ? d.online
    : d.presence?.toLowerCase() === "online");

const vehicleText = (v?: Vehicle) => {
  if (!v) return "—";
  if (typeof v === "string") return v || "—";
  const parts = [
    v.make,
    v.model,
    v.year ? String(v.year) : undefined,
    v.plate ? `(${v.plate})` : undefined,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
};

function Avatar({
  name,
  url,
  size = 56,
}: {
  name?: string;
  url?: string | null;
  size?: number;
}) {
  const initials = useMemo(
    () =>
      (name || "?")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .slice(0, 2)
        .join(""),
    [name]
  );
  return (
    <UiAvatar style={{ width: size, height: size }}>
      <AvatarImage src={url || undefined} alt={name || "Driver"} />
      <AvatarFallback className="bg-accent text-accent-foreground font-bold">
        {initials || "?"}
      </AvatarFallback>
    </UiAvatar>
  );
}

function ApprovalPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "bg-secondary text-secondary-foreground ring-border"
      : s === "pending"
      ? "bg-accent text-accent-foreground ring-border"
      : "bg-muted text-foreground ring-border";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

function PresenceDot({ online }: { online?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          online ? "bg-primary" : "bg-muted"
        }`}
        aria-hidden
      />
      <span className="text-xs text-muted-foreground">
        {online ? "Online" : "Offline"}
      </span>
    </span>
  );
}

function JobStatus({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "completed" || s === "delivered"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s === "assigned" || s === "in_progress" || s === "pending"
      ? "bg-blue-50 text-blue-800 ring-blue-200"
      : s === "cancelled"
      ? "bg-rose-50 text-rose-800 ring-rose-200"
      : "bg-gray-100 text-gray-800 ring-gray-200";
  return <Badge className={`capitalize ${cls}`}>{status || "—"}</Badge>;
}

export default function DriverPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetDriver(id);
        if (data && typeof data === "object" && "driver" in (data)) {
          setDriver((data).driver);
          setJobs((data).jobs ?? []);
          setCurrentJob((data).currentJob ?? null);
        } else {
          const d = data as Driver;
          setDriver(d);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const maybeJobs = (d as any)?.jobs as Job[] | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const maybeCurrent = (d as any)?.currentJob as Job | undefined;
          setJobs(maybeJobs ?? []);
          setCurrentJob(maybeCurrent ?? null);
        }
      } catch (e) {
        setError((e as Error)?.message || "Failed to load driver");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  const online = isOnline(driver);
  const joined = driver?.createdAt
    ? new Date(driver.createdAt).toLocaleDateString()
    : undefined;

  async function approve() {
    if (!driver) return;
    try {
      setActionBusy(true);
      setNotice(null);
      setDriver({ ...driver, status: "approved" }); // optimistic
      await adminApproveDriver(driver.id);
      setNotice("Driver approved.");
    } catch (e) {
      setError((e as Error)?.message || "Approve failed");
      // refetch to be safe
    } finally {
      setActionBusy(false);
    }
  }

  async function disable() {
    if (!driver) return;
    if (!confirm("Disable this driver account?")) return;
    const prev = driver.status;
    try {
      setActionBusy(true);
      setNotice(null);
      setDriver({ ...driver, status: "disabled" }); // optimistic
      await adminDisableDriver(driver.id);
      setNotice("Driver disabled.");
    } catch (e) {
      setDriver({ ...driver, status: prev });
      setError((e as Error)?.message || "Disable failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function resetPassword() {
    if (!driver) return;
    if (!confirm("Send password reset to this driver?")) return;
    try {
      setActionBusy(true);
      setNotice(null);
      await adminResetDriverPassword(driver.id);
      setNotice("Password reset initiated.");
    } catch (e) {
      setError((e as Error)?.message || "Reset failed");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold">Driver</h1>
        </div>
        {loading ? (
          <span className="text-muted-foreground">Loading…</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : driver ? (
          <div className="flex items-center gap-3">
            <PresenceDot online={online} />
            <ApprovalPill status={driver.status} />
          </div>
        ) : null}
      </div>

      {notice && (
        <div className="text-sm text-primary bg-primary/10 ring-1 ring-border px-3 py-2 rounded">
          {notice}
        </div>
      )}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 ring-1 ring-border px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Personal details */}
      <Card>
        <CardContent className="p-5">
          {loading ? (
            <div className="h-20 animate-pulse bg-muted" />
          ) : driver ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={driver.name} url={driver.avatarUrl} size={64} />
                <div>
                  <div className="text-lg font-semibold">
                    {driver.name || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {driver.email ? (
                      <a
                        className="text-indigo-600 hover:underline"
                        href={`mailto:${driver.email}`}
                      >
                        {driver.email}
                      </a>
                    ) : (
                      "—"
                    )}
                    {driver.phone ? (
                      <span className="ml-2">• {driver.phone}</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {joined ? `Joined ${joined}` : null}
                    {typeof driver.totalCompleted === "number" ? (
                      <span className="ml-2 text-muted-foreground">
                        • {driver.totalCompleted} completed
                      </span>
                    ) : null}
                    {typeof driver.earnings === "number" ? (
                      <span className="ml-2 text-muted-foreground">
                        • {currency(driver.earnings)} earned
                      </span>
                    ) : null}
                  </div>
                  {driver.address ? (
                    <div className="text-xs text-muted-foreground mt-1">
                      {driver.address}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(driver.status || "").toLowerCase() !== "approved" && (
                  <Button
                    onClick={approve}
                    disabled={actionBusy}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve driver
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={disable}
                  disabled={actionBusy}
                >
                  Disable driver
                </Button>
                <Button
                  variant="outline"
                  onClick={resetPassword}
                  disabled={actionBusy}
                >
                  Reset password
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Driver not found.</div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle information + License */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vehicle information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 animate-pulse bg-muted" />
            ) : (
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Vehicle</dt>
                <dd className="col-span-2">{vehicleText(driver?.vehicle)}</dd>

                {typeof driver?.vehicle === "object" && driver?.vehicle ? (
                  <>
                    <dt className="text-muted-foreground">Make</dt>
                    <dd className="col-span-2">{driver.vehicle.make || "—"}</dd>
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="col-span-2">
                      {driver.vehicle.model || "—"}
                    </dd>
                    <dt className="text-muted-foreground">Plate</dt>
                    <dd className="col-span-2">
                      {driver.vehicle.plate || "—"}
                    </dd>
                    <dt className="text-muted-foreground">Color</dt>
                    <dd className="col-span-2">
                      {driver.vehicle.color || "—"}
                    </dd>
                    <dt className="text-muted-foreground">Year</dt>
                    <dd className="col-span-2">{driver.vehicle.year || "—"}</dd>
                  </>
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">License document</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 animate-pulse bg-muted" />
            ) : driver?.licenseDocumentUrl || driver?.licenseNumber ? (
              <div className="space-y-2 text-sm">
                {driver.licenseNumber ? (
                  <div>
                    <span className="text-muted-foreground">Number:</span>{" "}
                    {driver.licenseNumber}
                  </div>
                ) : null}
                {driver.licenseDocumentUrl ? (
                  <a
                    href={driver.licenseDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View document
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No license document on file.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Currently assigned job */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Current job</CardTitle>
          {currentJob ? (
            <Button asChild variant="link" className="h-auto p-0">
              <Link
                to={`/admin/orders/${encodeURIComponent(
                  String(currentJob.id)
                )}`}
              >
                Open
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-10 animate-pulse bg-muted" />
          ) : currentJob ? (
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">#{currentJob.id}</div>
                <JobStatus status={currentJob.status} />
              </div>
              <div className="text-muted-foreground">
                {currentJob.customerName ? (
                  <>Customer: {currentJob.customerName}</>
                ) : null}
              </div>
              <div className="text-muted-foreground">
                Created: {new Date(currentJob.createdAt).toLocaleString()}
              </div>
              <div className="text-gray-900 font-medium">
                Amount: {currency(currentJob.amount)}
              </div>
              {currentJob.pickupAddress || currentJob.dropoffAddress ? (
                <div className="text-muted-foreground">
                  <div>Pickup: {currentJob.pickupAddress || "—"}</div>
                  <div>Dropoff: {currentJob.dropoffAddress || "—"}</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No current job assigned.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed jobs */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Completed jobs</CardTitle>
          <Button asChild variant="link" className="h-auto p-0">
            <Link
              to={`/admin/orders?driverId=${encodeURIComponent(
                String(driver?.id ?? "")
              )}`}
            >
              View all
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">ID</TableHead>
                <TableHead className="text-left">Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link
                          to={`/admin/orders/${encodeURIComponent(
                            String(j.id)
                          )}`}
                        >
                          {j.id}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>{j.customerName || "—"}</TableCell>
                    <TableCell className="text-right">
                      {currency(j.amount)}
                    </TableCell>
                    <TableCell>
                      <JobStatus status={j.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(j.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No completed jobs
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
