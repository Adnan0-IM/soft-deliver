import type React from "react";
import axiosClient from "@/api/axiosClient";
import { useAuthStore } from "@/auth/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [photoUrl, setPhotoUrl] = useState<string>(user?.photoUrl || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      let res;
      if (photoFile) {
        const form = new FormData();
        form.append("name", name);
        form.append("email", email);
        form.append("phone", phone);
        form.append("location", location);
        form.append("photo", photoFile);
        res = await axiosClient.put("/auth/profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axiosClient.put("/auth/profile", {
          name,
          email,
          phone,
          location,
        });
      }
      if (res?.data?.accessToken) setToken(res.data.accessToken);
      setSaved(true);
    } catch (err) {
      setError((err as Error)?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container px-4 lg:px-8 py-4 grid gap-4">
      <h1 className="text-2xl font-semibold">Profile</h1>

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

      <form onSubmit={onSave} className="grid gap-3 max-w-2xl">
        {/* Photo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 py-4">
            <img
              src={photoUrl || ""}
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

        {/* Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-555-5555"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
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
    </div>
  );
}
