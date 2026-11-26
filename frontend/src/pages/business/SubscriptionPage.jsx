import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import { formatDateTime, formatPrice } from "../../utils/format";

export default function SubscriptionPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/workspace/subscription").then((res) => setData(res.data.data)); }, []);
  if (!data) return <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold">Subscription</h1>
      <Card className="mt-6 space-y-2 p-6 text-sm">
        <p className="text-lg font-extrabold">{data.plan?.name}</p>
        <p>Status: {data.status}</p>
        {data.plan?.monthlyPriceMinor != null && <p>Monthly price: {formatPrice(data.plan.monthlyPriceMinor)}</p>}
        {data.endAt && <p>Renews or ends: {formatDateTime(data.endAt)}</p>}
        <p>Staff limit: {data.plan?.limits?.maxStaff}</p>
        <p>Menu items: {data.plan?.limits?.maxMenuItems}</p>
        <p>Tables: {data.plan?.limits?.maxTables}</p>
        <p className="text-slate-500">Payment is collected manually during the pilot. A platform admin activates a paid plan.</p>
      </Card>
    </div>
  );
}
