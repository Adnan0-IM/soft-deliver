import { useEffect, useState } from "react";
import { getDriverMe, updateDriverProfile } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h2 className="text-2xl font-semibold">Profile</h2>

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
        <form onSubmit={onSave} className="grid gap-3 max-w-2xl">
          {/* Photo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4 py-4">
              <img
                src={form.photoUrl || data?.photoUrl || ""}
                alt="Profile"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
                className="size-24 rounded-full border object-cover"
              />
              <div className="grid gap-1.5 text-sm">
                <Label>Upload new photo</Label>
                <Input type="file" accept="image/*" onChange={onPhotoChange} />
                <div className="text-xs text-muted-foreground">
                  Accepted formats: JPG/PNG. Max ~5MB (server may enforce).
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+1 555-555-5555"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">License number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={form.licenseNumber ?? ""}
                  onChange={onChange}
                  placeholder="DL-1234567"
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
