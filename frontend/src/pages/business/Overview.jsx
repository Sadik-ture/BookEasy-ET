import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/workspace/dashboard").then((res) => setData(res.data.data)).catch(() => setError("Could not load today's summary."));
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <div className="h-40 animate-pulse rounded-3xl bg-surface" />;

  const stats = [
    ["Bookings today", data.bookingsToday],
    ["Pending bookings", data.pendingBookings],
    ["Orders today", data.ordersToday],
    ["Orders waiting", data.pendingOrders],
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-extrabold text-ink-900">Today</h1>
      <p className="mt-1 text-ink-700">{data.business.name} is {data.business.status}.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-ink-700">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-ink-900">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/workspace/bookings" variant="soft">Bookings</Button>
        <Button as={Link} to="/workspace/orders" variant="soft">Orders</Button>
      </div>
    </div>
  );
}
