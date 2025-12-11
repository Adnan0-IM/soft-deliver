import { useEffect, useState } from "react";
import { getDriverVehicle, updateDriverVehicle } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Vehicle = {
  type: string;
  plateNumber: string;
  model?: string;
  color?: string;
  year?: number;
};

export default function Vehicle() {
  const [form, setForm] = useState<Vehicle>({
    type: "",
    plateNumber: "",
    model: "",
    color: "",
    year: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const v = await getDriverVehicle();
        if (!mounted) return;
        setForm({
          type: v.type ?? "",
          plateNumber: v.plateNumber ?? "",
          model: v.model ?? "",
          color: v.color ?? "",
          year: v.year ?? undefined,
        });
      } catch (e) {
        setError((e as Error)?.message || "Failed to load vehicle.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateDriverVehicle(form);
      setSaved(true);
    } catch (err) {
      setError((err as Error)?.message || "Failed to update vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Vehicle</h2>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 px-3 py-2">
          Saved successfully.
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="grid gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Vehicle type</Label>
                <Input
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  placeholder="Car, Bike, Scooter, Van"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="plateNumber">Plate number</Label>
                <Input
                  id="plateNumber"
                  name="plateNumber"
                  value={form.plateNumber}
                  onChange={onChange}
                  placeholder="ABC-1234"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={form.model ?? ""}
                  onChange={onChange}
                  placeholder="Toyota Corolla"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={form.color ?? ""}
                  onChange={onChange}
                  placeholder="Blue"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min={1970}
                  max={new Date().getFullYear() + 1}
                  value={form.year ?? ""}
                  onChange={onChange}
                  placeholder="2020"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="submit" disabled={saving} aria-busy={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
