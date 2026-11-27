import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { formatDateTime, formatPrice } from "../../utils/format";

const NEXT = {
  pending: ["confirmed", "rejected"],
  confirmed: ["completed", "no_show", "cancelled"],
};

export default function BookingsManage() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/workspace/bookings").then((res) => setItems(res.data.data.items));
  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  const setStatus = (id, status) => api.patch(`/workspace/bookings/${id}/status`, { status }).then(load);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Bookings</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 && <p className="text-sm text-ink-700">No bookings yet.</p>}
        {items.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold">{b.serviceName}</p>
                <p className="text-sm text-ink-700">{b.customerName} · {b.staffName}</p>
                <p className="text-sm text-ink-700">{formatDateTime(b.startAt)} · {formatPrice(b.priceMinor, b.currency)}</p>
              </div>
              <Badge>{b.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(NEXT[b.status] || []).map((status) => (
                <Button key={status} size="sm" variant="outline" onClick={() => setStatus(b.id, status)}>{status}</Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
