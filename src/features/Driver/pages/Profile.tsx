import { useEffect, useState } from "react";
import { getDriverMe, updateDriverProfile } from "../api";

type DriverProfile = {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  photoUrl?: string;
};

export default function Profile() {
  const [data, setData] = useState<DriverProfile | null>(null);
  const [form, setForm] = useState<DriverProfile>({
    fullName: "",
    phone: "",
    email: "",
    licenseNumber: "",
    photoUrl: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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
        const me = await getDriverMe();
        if (!mounted) return;
        setData(me);
        setForm({
          fullName: me.fullName ?? "",
          phone: me.phone ?? "",
          email: me.email ?? "",
          licenseNumber: me.licenseNumber ?? "",
          photoUrl: me.photoUrl ?? "",
        });
      } catch (e) {
        setError((e as Error)?.message || "Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    // preview (optional)
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, photoUrl: url }));
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateDriverProfile({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        licenseNumber: form.licenseNumber,
        photoFile, // optional
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error)?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Profile</h2>

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
          {/* Photo */}
          <section
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <img
              src={form.photoUrl || data?.photoUrl || ""}
              alt="Profile"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
              style={{
                width: 96,
                height: 96,
                objectFit: "cover",
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
              }}
            />
            <div style={{ display: "grid", gap: 6 }}>
              <label>
                <strong>Photo</strong>
              </label>
              <input type="file" accept="image/*" onChange={onPhotoChange} />
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Accepted formats: JPG/PNG. Max ~5MB (server may enforce).
              </div>
            </div>
          </section>

          {/* Fields */}
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
              <label htmlFor="fullName">
                <strong>Full name</strong>
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="John Doe"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="phone">
                <strong>Phone</strong>
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+1 555-555-5555"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="john@example.com"
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="licenseNumber">
                <strong>License number</strong>
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                value={form.licenseNumber ?? ""}
                onChange={onChange}
                placeholder="DL-1234567"
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
