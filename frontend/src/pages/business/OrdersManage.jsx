import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { formatPrice } from "../../utils/format";
import { ORDER_STATUS } from "../../utils/orderStatus";
import { parseApiError } from "../../utils/apiError";

export default function OrdersManage() {
  const { membership } = useOutletContext();
  const canAccept = membership.role !== "kitchen";
  const canCook = membership.permissions.includes("kitchen");
  const [items, setItems] = useState([]);
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState("");

  const load = () => api.get("/workspace/orders", { params: { scope: "active" } }).then((res) => setItems(res.data.data.items));
  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const update = async (id, status) => {
    setError("");
    try {
      await api.patch(`/workspace/orders/${id}/status`, status === "accepted" ? { status, estimatedMinutes: Number(minutes) } : { status });
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Orders</h1>
        <label className="text-sm font-semibold">Prep minutes
          <input type="number" min="5" max="240" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="ml-2 h-10 w-20 rounded-xl border px-2" />
        </label>
      </div>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm text-ink-700">No active orders. New orders appear here within a few seconds.</p>}
        {items.map((o) => {
          const st = ORDER_STATUS[o.status] || { label: o.status };
          return (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-extrabold">{o.orderNumber}</p>
                  <p className="text-sm text-ink-700">{o.customerName} · {o.type === "dine_in" ? `Table ${o.tableLabel}` : "Takeaway"} · {o.phone}</p>
                </div>
                <Badge tone={st.tone || "brand"}>{st.label}</Badge>
              </div>
              <ul className="mt-3 text-sm text-ink-700">
                {o.items.map((i) => <li key={i.name}>{i.quantity} × {i.name}</li>)}
              </ul>
              <p className="mt-2 font-bold">{formatPrice(o.totalMinor, o.currency)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status === "pending" && canAccept && (
                  <>
                    <Button size="sm" onClick={() => update(o.id, "accepted")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => update(o.id, "rejected")}>Reject</Button>
                  </>
                )}
                {o.status === "accepted" && canCook && <Button size="sm" onClick={() => update(o.id, "preparing")}>Preparing</Button>}
                {o.status === "preparing" && canCook && <Button size="sm" onClick={() => update(o.id, "ready")}>Ready</Button>}
                {o.status === "ready" && canCook && <Button size="sm" onClick={() => update(o.id, "completed")}>Complete</Button>}
                {["pending", "accepted", "preparing"].includes(o.status) && canAccept && (
                  <Button size="sm" variant="ghost" onClick={() => update(o.id, "cancelled")}>Cancel</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
