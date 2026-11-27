import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import { formatPrice } from "../../utils/format";
import { parseApiError } from "../../utils/apiError";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/workspace/reports").then((res) => setData(res.data.data)).catch((err) => setError(parseApiError(err).message));
  }, []);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Reports</h1>
      {error && <Card className="mt-6 p-6 text-sm text-ink-700">{error}</Card>}
      {data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><p className="text-sm text-ink-700">Completed orders (30 days)</p><p className="mt-2 text-3xl font-extrabold">{data.completedOrders}</p></Card>
          <Card className="p-5"><p className="text-sm text-ink-700">Revenue</p><p className="mt-2 text-3xl font-extrabold">{formatPrice(data.revenueMinor)}</p></Card>
          <Card className="p-5"><p className="text-sm text-ink-700">Completed bookings</p><p className="mt-2 text-3xl font-extrabold">{data.completedBookings}</p></Card>
          <Card className="p-5 sm:col-span-3">
            <p className="font-bold">Top items</p>
            <ul className="mt-2 text-sm text-ink-700">
              {data.topItems.map((i) => <li key={i.name}>{i.name} · {i.quantity}</li>)}
              {data.topItems.length === 0 && <li>No completed item data yet.</li>}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
