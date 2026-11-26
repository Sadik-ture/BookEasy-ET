import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";

export default function TablesPage() {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/workspace/tables").then((res) => setItems(res.data.data.items));
  useEffect(() => { load().catch((err) => setError(parseApiError(err).message)); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workspace/tables", { label });
      setLabel("");
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Tables and QR codes</h1>
      <p className="mt-1 text-sm text-slate-500">Print the QR and put it on the table. Scanning opens that table's menu. A live connection is required to place an order.</p>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <form onSubmit={create} className="mt-6 flex gap-3">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Table 1" className="h-11 flex-1 rounded-xl border px-3" required />
        <Button type="submit">Add table</Button>
      </form>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((t) => (
          <Card key={t.id} className="p-4">
            <p className="font-extrabold">{t.label}</p>
            <img alt={`QR for ${t.label}`} src={`/api/v1/workspace/tables/${t.id}/qr?businessId=${localStorage.getItem("bookeasy_workspace") || ""}`} className="mt-3 w-40 rounded-xl bg-white" />
            <p className="mt-2 break-all text-xs text-slate-500">{window.location.origin}{t.path}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => api.post(`/workspace/tables/${t.id}/qr`).then(load)}>Rotate code</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
