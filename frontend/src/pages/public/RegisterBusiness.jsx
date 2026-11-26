import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const field = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

export default function RegisterBusiness() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "barbershop",
    description: "",
    phone: "",
    address: { line: "", area: "", city: "Addis Ababa" },
    openingHours: DAYS.map((_, day) => ({ day, open: "09:00", close: "18:00", closed: false })),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/businesses/register", form);
      localStorage.setItem("bookeasy_workspace", res.data.data.business.id);
      await refresh();
      navigate("/workspace");
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">List your business</h1>
      <p className="mt-1 text-sm text-slate-500">It stays hidden until a platform admin approves it. You can still set up the workspace.</p>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <Card className="mt-6 space-y-4 p-6">
        <input className={field} placeholder="Business name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="barbershop">Barbershop</option>
          <option value="salon">Beauty salon</option>
          <option value="restaurant">Restaurant</option>
        </select>
        <textarea className={`${field} h-24 py-2`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-3">
          {["line", "area", "city"].map((key) => (
            <input key={key} className={field} placeholder={key} value={form.address[key]} onChange={(e) => setForm({ ...form, address: { ...form.address, [key]: e.target.value } })} required={key === "city"} />
          ))}
        </div>
      </Card>
      <Button type="submit" className="mt-6" loading={saving}>Submit for approval</Button>
    </form>
  );
}
