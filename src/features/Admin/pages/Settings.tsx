import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Company = {
  name?: string;
  email?: string;
  supportEmail?: string;
  supportPhone?: string;
};

type RideRates = {
  baseFare?: number;
  perKm?: number;
  perMin?: number;
  currency?: string;
};

type DeliveryRates = {
  baseFare?: number;
  perKm?: number;
  perKg?: number;
  currency?: string;
};

type Requirements = {
  minDriverAge?: number;
  minVehicleYear?: number;
  requireLicense?: boolean;
  requireInsurance?: boolean;
};



import {
  adminGetSettings,
  adminUpdateSettings,
  adminUpdateRates,
} from "@/features/Admin/api";

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function Settings() {
  // Load state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Company
  const [company, setCompany] = useState<Company>({
    name: "",
    email: "",
    supportEmail: "",
    supportPhone: "",
  });

  // Rates
  const [rideRates, setRideRates] = useState<RideRates>({
    baseFare: undefined,
    perKm: undefined,
    perMin: undefined,
    currency: "USD",
  });
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRates>({
    baseFare: undefined,
    perKm: undefined,
    perKg: undefined,
    currency: "USD",
  });

  // Requirements
  const [requirements, setRequirements] = useState<Requirements>({
    minDriverAge: 18,
    minVehicleYear: 2005,
    requireLicense: true,
    requireInsurance: true,
  });

  // Admin password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordValid = useMemo(
    () => newPassword.length >= 6 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  // Busy flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRates, setSavingRates] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetSettings();
        if (data.company) setCompany({ ...company, ...data.company });
        if (data.rideRates) setRideRates((r) => ({ ...r, ...data.rideRates }));
        if (data.deliveryRates)
          setDeliveryRates((r) => ({ ...r, ...data.deliveryRates }));
        if (data.requirements)
          setRequirements((r) => ({ ...r, ...data.requirements }));
      } catch (e) {
        if (( e as Error)?.name !== "AbortError")
          setError((e as Error)?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  async function saveProfile(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setSavingProfile(true);
      setNotice(null);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { company, requirements };
      if (currentPassword && newPassword && passwordValid) {
        body.password = { current: currentPassword, next: newPassword };
      }

      await adminUpdateSettings(body);
      setNotice("Settings updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError((e as Error)?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveRates(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setSavingRates(true);
      setNotice(null);
      setError(null);
      await adminUpdateRates({ rideRates, deliveryRates });
      setNotice("Rates updated.");
    } catch (e) {
      setError((e as Error)?.message || "Update failed");
    } finally {
      setSavingRates(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {loading ? (
          <span className="text-muted-foreground">Loading…</span>
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

      {/* Company profile + requirements + admin password */}
      <Section
        title="Company profile"
        right={
          <Button
            onClick={saveProfile}
            disabled={
              savingProfile ||
              loading ||
              (!!(currentPassword || newPassword || confirmPassword) &&
                !passwordValid)
            }
            className="h-9"
          >
            Save
          </Button>
        }
      >
        <form onSubmit={saveProfile} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Company name</Label>
              <Input
                value={company.name || ""}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, name: e.target.value }))
                }
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Company email</Label>
              <Input
                type="email"
                value={company.email || ""}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, email: e.target.value }))
                }
                placeholder="admin@company.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Support email</Label>
              <Input
                type="email"
                value={company.supportEmail || ""}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, supportEmail: e.target.value }))
                }
                placeholder="support@company.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Support phone</Label>
              <Input
                value={company.supportPhone || ""}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, supportPhone: e.target.value }))
                }
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Driver requirements</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Minimum driver age</Label>
                <Input
                  value={
                    typeof requirements.minDriverAge === "number"
                      ? String(requirements.minDriverAge)
                      : ""
                  }
                  onChange={(e) =>
                    setRequirements((r) => ({
                      ...r,
                      minDriverAge:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                  step="1"
                  min={16}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Minimum vehicle year</Label>
                <Input
                  value={
                    typeof requirements.minVehicleYear === "number"
                      ? String(requirements.minVehicleYear)
                      : ""
                  }
                  onChange={(e) =>
                    setRequirements((r) => ({
                      ...r,
                      minVehicleYear:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                  step="1"
                  min={1980}
                />
              </div>
              <div className="flex items-center justify-between md:col-span-1">
                <Label>Driver must upload license</Label>
                <Switch
                  checked={!!requirements.requireLicense}
                  onCheckedChange={(v) =>
                    setRequirements((r) => ({ ...r, requireLicense: v }))
                  }
                />
              </div>
              <div className="flex items-center justify-between md:col-span-1">
                <Label>Vehicle insurance required</Label>
                <Switch
                  checked={!!requirements.requireInsurance}
                  onCheckedChange={(v) =>
                    setRequirements((r) => ({ ...r, requireInsurance: v }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Change admin password</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            {(newPassword || confirmPassword) && !passwordValid && (
              <div className="text-xs text-rose-700">
                Passwords must match and be at least 6 characters.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                savingProfile ||
                (!!(currentPassword || newPassword || confirmPassword) &&
                  !passwordValid)
              }
              className="h-9"
            >
              Save
            </Button>
          </div>
        </form>
      </Section>

      {/* Rates */}
      <Section
        title="Pricing rates"
        right={
          <Button
            onClick={saveRates}
            disabled={savingRates || loading}
            className="h-9"
          >
            Save rates
          </Button>
        }
      >
        <form onSubmit={saveRates} className="grid gap-6">
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Ride pricing</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-1.5">
                <Label>Currency</Label>
                <Input
                  value={rideRates.currency || "USD"}
                  onChange={(e) =>
                    setRideRates((r) => ({
                      ...r,
                      currency: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="USD"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Base fare</Label>
                <Input
                  value={
                    typeof rideRates.baseFare === "number"
                      ? String(rideRates.baseFare)
                      : ""
                  }
                  onChange={(e) =>
                    setRideRates((r) => ({
                      ...r,
                      baseFare:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Per km</Label>
                <Input
                  value={
                    typeof rideRates.perKm === "number"
                      ? String(rideRates.perKm)
                      : ""
                  }
                  onChange={(e) =>
                    setRideRates((r) => ({
                      ...r,
                      perKm:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Per minute</Label>
                <Input
                  value={
                    typeof rideRates.perMin === "number"
                      ? String(rideRates.perMin)
                      : ""
                  }
                  onChange={(e) =>
                    setRideRates((r) => ({
                      ...r,
                      perMin:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Delivery pricing</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="grid gap-1.5">
                <Label>Currency</Label>
                <Input
                  value={deliveryRates.currency || "USD"}
                  onChange={(e) =>
                    setDeliveryRates((r) => ({
                      ...r,
                      currency: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="USD"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Base fare</Label>
                <Input
                  value={
                    typeof deliveryRates.baseFare === "number"
                      ? String(deliveryRates.baseFare)
                      : ""
                  }
                  onChange={(e) =>
                    setDeliveryRates((r) => ({
                      ...r,
                      baseFare:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Per km</Label>
                <Input
                  value={
                    typeof deliveryRates.perKm === "number"
                      ? String(deliveryRates.perKm)
                      : ""
                  }
                  onChange={(e) =>
                    setDeliveryRates((r) => ({
                      ...r,
                      perKm:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Per kg</Label>
                <Input
                  value={
                    typeof deliveryRates.perKg === "number"
                      ? String(deliveryRates.perKg)
                      : ""
                  }
                  onChange={(e) =>
                    setDeliveryRates((r) => ({
                      ...r,
                      perKg:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingRates} className="h-9">
              Save rates
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
