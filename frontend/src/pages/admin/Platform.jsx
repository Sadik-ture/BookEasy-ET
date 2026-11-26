import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";
import { formatPrice } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

function useData(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => api.get(path).then((res) => setData(res.data.data)).catch((err) => setError(parseApiError(err).message));
  useEffect(() => { load(); }, [path]);
  return { data, error, reload: load };
}

export function AdminHome() {
  const { data, error } = useData("/admin/metrics");
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Object.entries(data).map(([k, v]) => (
        <Card key={k} className="p-5"><p className="text-sm capitalize text-slate-500">{k}</p><p className="mt-2 text-3xl font-extrabold">{v}</p></Card>
      ))}
    </div>
  );
}

export function AdminBusinesses() {
  const { data, error, reload } = useData("/admin/businesses");
  if (error) return <p>{error}</p>;
  if (!data) return null;
  const setStatus = (id, status) => api.patch(`/admin/businesses/${id}/status`, { status }).then(reload);
  return (
    <div className="space-y-3">
      {data.items.map((b) => (
        <Card key={b._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="font-bold">{b.name}</p><p className="text-sm text-slate-500">{b.category} · {b.status}</p></div>
          <div className="flex gap-2">
            {["approved", "rejected", "suspended"].map((status) => (
              <Button key={status} size="sm" variant="outline" onClick={() => setStatus(b._id, status)}>{status}</Button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdminUsers() {
  const { user } = useAuth();
  const { data, error, reload } = useData("/admin/users");
  if (error) return <p>{error}</p>;
  if (!data) return null;
  return (
    <div className="space-y-3">
      {data.items.map((u) => (
        <Card key={u._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="font-bold">{u.fullName}</p><p className="text-sm text-slate-500">{u.email} · {u.role} · {u.status}</p></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => api.patch(`/admin/users/${u._id}/status`, { status: u.status === "active" ? "suspended" : "active" }).then(reload)}>
              {u.status === "active" ? "Suspend" : "Activate"}
            </Button>
            {user.role === "super_admin" && u.role === "customer" && (
              <Button size="sm" variant="soft" onClick={() => api.patch(`/admin/users/${u._id}/role`, { role: "support_admin" }).then(reload)}>Make support</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdminPlans() {
  const plans = useData("/admin/plans");
  const businesses = useData("/admin/businesses");
  const [businessId, setBusinessId] = useState("");
  const [planId, setPlanId] = useState("");
  const [message, setMessage] = useState("");
  if (!plans.data || !businesses.data) return null;
  const assign = async (e) => {
    e.preventDefault();
    await api.post("/admin/subscriptions", { businessId, planId, months: 1 });
    setMessage("Subscription activated for 1 month.");
  };
  return (
    <div className="space-y-4">
      {plans.data.items.map((p) => (
        <Card key={p._id} className="p-4"><p className="font-bold">{p.name}</p><p className="text-sm text-slate-500">{formatPrice(p.monthlyPriceMinor)} / month · staff {p.limits.maxStaff}</p></Card>
      ))}
      <form onSubmit={assign} className="grid gap-3 sm:grid-cols-2">
        <select className="h-11 rounded-xl border px-3" value={businessId} onChange={(e) => setBusinessId(e.target.value)} required>
          <option value="">Business</option>
          {businesses.data.items.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select className="h-11 rounded-xl border px-3" value={planId} onChange={(e) => setPlanId(e.target.value)} required>
          <option value="">Plan</option>
          {plans.data.items.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <Button type="submit">Activate one month</Button>
      </form>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </div>
  );
}

export function AdminReviews() {
  const { data, reload } = useData("/admin/reviews");
  if (!data) return null;
  return (
    <div className="space-y-3">
      {data.items.map((r) => (
        <Card key={r._id} className="p-4">
          <p className="font-bold">{r.rating}/5 {r.hidden ? "hidden" : "visible"}</p>
          <p className="text-sm text-slate-600">{r.comment}</p>
          <Button size="sm" className="mt-2" variant="outline" onClick={() => api.patch(`/admin/reviews/${r._id}`, { hidden: !r.hidden }).then(reload)}>
            {r.hidden ? "Publish" : "Hide"}
          </Button>
        </Card>
      ))}
    </div>
  );
}

export function AdminSettings() {
  const { data, reload } = useData("/admin/categories");
  const audit = useData("/admin/audit");
  const [labels, setLabels] = useState(null);
  useEffect(() => {
    if (data?.categories) setLabels(Object.fromEntries(data.categories.map((c) => [c.key, c.label])));
  }, [data]);
  if (!labels) return null;
  return (
    <div className="space-y-6">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); api.patch("/admin/categories", { labels }).then(reload); }}>
        {Object.entries(labels).map(([key, label]) => (
          <label key={key} className="block text-sm font-semibold">{key}
            <input className="mt-1 h-11 w-full rounded-xl border px-3" value={label} onChange={(e) => setLabels({ ...labels, [key]: e.target.value })} />
          </label>
        ))}
        <Button type="submit">Save category labels</Button>
      </form>
      <div>
        <h2 className="font-extrabold">Audit log</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {(audit.data?.items || []).map((a) => (
            <li key={a._id}>{a.action} · {a.targetType}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
