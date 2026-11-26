import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";
import { formatPrice } from "../../utils/format";

const field = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

export default function MenuManage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [item, setItem] = useState({ categoryId: "", name: "", description: "", priceMinor: 8000 });
  const [error, setError] = useState("");

  const load = () => Promise.all([api.get("/workspace/menu/categories"), api.get("/workspace/menu/items")]).then(([c, i]) => {
    setCategories(c.data.data.items);
    setItems(i.data.data.items);
    setItem((prev) => ({ ...prev, categoryId: prev.categoryId || c.data.data.items[0]?._id || "" }));
  });
  useEffect(() => { load(); }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/workspace/menu/categories", { name });
      setName("");
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workspace/menu/items", { ...item, priceMinor: Number(item.priceMinor) });
      setItem({ ...item, name: "", description: "" });
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const upload = (id) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    await api.post(`/workspace/menu/items/${id}/image`, body);
    load();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Menu</h1>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <form onSubmit={addCategory} className="mt-6 flex gap-3">
        <input className={field} placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit">Add</Button>
      </form>
      <form onSubmit={addItem} className="mt-4 grid gap-3 sm:grid-cols-2">
        <select className={field} value={item.categoryId} onChange={(e) => setItem({ ...item, categoryId: e.target.value })}>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input className={field} placeholder="Item name" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} required />
        <input className={field} placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} />
        <input className={field} type="number" min="0" value={item.priceMinor} onChange={(e) => setItem({ ...item, priceMinor: e.target.value })} />
        <Button type="submit" className="sm:col-span-2">Add item</Button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((row) => (
          <Card key={row._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-bold">{row.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(row.priceMinor)} · {row.available ? "Available" : "Hidden"}</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload(row._id)} className="text-xs" />
              <Button size="sm" variant="outline" onClick={() => api.patch(`/workspace/menu/items/${row._id}`, { available: !row.available }).then(load)}>
                {row.available ? "Hide" : "Show"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
