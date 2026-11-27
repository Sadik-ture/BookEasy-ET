import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const field = "h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-500";

export default function ProfileSettings() {
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/workspace/profile").then((res) => {
      const b = res.data.data.business;
      setForm({
        name: b.name,
        description: b.description || "",
        phone: b.phone || "",
        address: { line: b.address?.line || "", area: b.address?.area || "", city: b.address?.city || "Addis Ababa" },
        openingHours: b.openingHours?.length
          ? b.openingHours
          : DAYS.map((_, day) => ({ day, open: "09:00", close: "18:00", closed: false })),
        acceptingRequests: b.acceptingRequests !== false,
      });
    });
  }, []);

  if (!form) return <div className="h-40 animate-pulse rounded-3xl bg-surface" />;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.patch("/workspace/profile", form);
      setMessage("Profile saved.");
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const upload = (kind) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    try {
      await api.post(`/workspace/profile/${kind}`, body);
      setMessage("Image uploaded.");
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const setHour = (day, key, value) => {
    setForm({
      ...form,
      openingHours: form.openingHours.map((h) => (h.day === day ? { ...h, [key]: value } : h)),
    });
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold text-ink-900">Business profile</h1>
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <Card className="space-y-4 p-6">
        <label className="block text-sm font-semibold">Name<input className={`${field} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Description<textarea className={`${field} mt-1 h-24 py-2`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Phone<input className={`${field} mt-1`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <div className="grid gap-3 sm:grid-cols-3">
          {["line", "area", "city"].map((key) => (
            <label key={key} className="block text-sm font-semibold capitalize">{key}
              <input className={`${field} mt-1`} value={form.address[key]} onChange={(e) => setForm({ ...form, address: { ...form.address, [key]: e.target.value } })} />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.acceptingRequests} onChange={(e) => setForm({ ...form, acceptingRequests: e.target.checked })} />
          Accept new bookings and orders
        </label>
      </Card>
      <Card className="space-y-2 p-6">
        <h2 className="font-extrabold">Opening hours</h2>
        {form.openingHours.map((h) => (
          <div key={h.day} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm">
            <span>{DAYS[h.day]}</span>
            <input type="time" value={h.open} onChange={(e) => setHour(h.day, "open", e.target.value)} className="rounded-lg border px-2 py-1" />
            <input type="time" value={h.close} onChange={(e) => setHour(h.day, "close", e.target.value)} className="rounded-lg border px-2 py-1" />
            <label className="flex items-center gap-1"><input type="checkbox" checked={h.closed} onChange={(e) => setHour(h.day, "closed", e.target.checked)} /> Closed</label>
          </div>
        ))}
      </Card>
      <Card className="grid gap-3 p-6 sm:grid-cols-3">
        <label className="text-sm font-semibold">Logo<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block text-xs" onChange={upload("logo")} /></label>
        <label className="text-sm font-semibold">Cover<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block text-xs" onChange={upload("cover")} /></label>
        <label className="text-sm font-semibold">Gallery<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block text-xs" onChange={upload("gallery")} /></label>
      </Card>
      <Button type="submit" loading={saving}>Save profile</Button>
    </form>
  );
}
