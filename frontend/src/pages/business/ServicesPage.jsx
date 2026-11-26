import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";
import { formatPrice } from "../../utils/format";

const field = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

export default function ServicesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", priceMinor: 15000, durationMinutes: 30 });
  const [error, setError] = useState("");

  const load = () => api.get("/workspace/services").then((res) => setItems(res.data.data.items));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workspace/services", { ...form, priceMinor: Number(form.priceMinor), durationMinutes: Number(form.durationMinutes) });
      setForm({ name: "", description: "", priceMinor: 15000, durationMinutes: 30 });
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const toggle = (item) => api.patch(`/workspace/services/${item._id}`, { active: !item.active }).then(load);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Services</h1>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <form onSubmit={create} className="mt-6 grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className={field} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className={field} type="number" min="0" placeholder="Price in cents of birr" value={form.priceMinor} onChange={(e) => setForm({ ...form, priceMinor: e.target.value })} />
        <input className={field} type="number" min="5" placeholder="Minutes" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
        <Button type="submit" className="sm:col-span-2">Add service</Button>
      </form>
      <p className="mt-2 text-xs text-slate-500">Price is in minor units. 15000 = ETB 150.</p>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <Card key={item._id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(item.priceMinor)} · {item.durationMinutes} min</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggle(item)}>{item.active ? "Pause" : "Activate"}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
