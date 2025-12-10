import { useEffect, useState } from "react";
import { getDriverVehicle, updateDriverVehicle } from "../api";

type Vehicle = {
  type: string;
  plateNumber: string;
  model?: string;
  color?: string;
  year?: number;
};

export default function Vehicle() {
  const [data, setData] = useState<Vehicle | null>(null);
  console.log(data)
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
        setData(v);
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
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Vehicle</h2>

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
      {saved && (
        <div
          style={{
            padding: 12,
            background: "#dcfce7",
            color: "#065f46",
            borderRadius: 6,
          }}
        >
          Saved successfully.
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <section
            style={{
              display: "grid",
              gap: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="type">
                <strong>Vehicle type</strong>
              </label>
              <input
                id="type"
                name="type"
                value={form.type}
                onChange={onChange}
                placeholder="Car, Bike, Scooter, Van"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="plateNumber">
                <strong>Plate number</strong>
              </label>
              <input
                id="plateNumber"
                name="plateNumber"
                value={form.plateNumber}
                onChange={onChange}
                placeholder="ABC-1234"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="model">
                <strong>Model</strong>
              </label>
              <input
                id="model"
                name="model"
                value={form.model ?? ""}
                onChange={onChange}
                placeholder="Toyota Corolla"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="color">
                <strong>Color</strong>
              </label>
              <input
                id="color"
                name="color"
                value={form.color ?? ""}
                onChange={onChange}
                placeholder="Blue"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="year">
                <strong>Year</strong>
              </label>
              <input
                id="year"
                name="year"
                type="number"
                min={1970}
                max={new Date().getFullYear() + 1}
                value={form.year ?? ""}
                onChange={onChange}
                placeholder="2020"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#111827",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                aria-busy={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </section>
        </form>
      )}
    </div>
  );
}
