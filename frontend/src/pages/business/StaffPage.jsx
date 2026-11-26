import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";

const field = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", title: "", serviceIds: [] });
  const [off, setOff] = useState({ id: "", startDate: "", endDate: "" });
  const [error, setError] = useState("");

  const load = () => Promise.all([api.get("/workspace/staff"), api.get("/workspace/services")]).then(([s, svc]) => {
    setStaff(s.data.data.items);
    setServices(svc.data.data.items.filter((i) => i.active !== false));
  });
  useEffect(() => { load(); }, []);

  const toggleService = (id) => {
    const has = form.serviceIds.includes(id);
    setForm({ ...form, serviceIds: has ? form.serviceIds.filter((x) => x !== id) : [...form.serviceIds, id] });
  };

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workspace/staff", form);
      setForm({ name: "", title: "", serviceIds: [] });
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Staff</h1>
      <p className="mt-1 text-sm text-slate-500">Empty working hours means this person follows the business hours. Time off blocks a whole date.</p>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <form onSubmit={create} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className={field} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <button type="button" key={s._id} onClick={() => toggleService(s._id)} className={`rounded-full px-3 py-1 text-xs font-bold ${form.serviceIds.includes(s._id) ? "bg-brand-600 text-white" : "bg-slate-100"}`}>
              {s.name}
            </button>
          ))}
        </div>
        <Button type="submit">Add staff</Button>
      </form>
      <div className="mt-6 space-y-3">
        {staff.map((person) => (
          <Card key={person._id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">{person.name}</p>
              <p className="text-sm text-slate-500">{person.title || "Staff"} · {person.active ? "Active" : "Paused"}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => api.patch(`/workspace/staff/${person._id}`, { active: !person.active }).then(load)}>
                {person.active ? "Pause" : "Activate"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOff({ id: person._id, startDate: "", endDate: "", existing: person.timeOff || [] })}>Time off</Button>
            </div>
          </Card>
        ))}
      </div>
      {off.id && (
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const timeOff = [...(off.existing || []), { startDate: off.startDate, endDate: off.endDate, reason: "Time off" }];
            api.patch(`/workspace/staff/${off.id}`, { timeOff }).then(() => { setOff({ id: "", startDate: "", endDate: "" }); load(); }).catch((err) => setError(parseApiError(err).message));
          }}
        >
          <input type="date" className={field} required value={off.startDate} onChange={(e) => setOff({ ...off, startDate: e.target.value })} />
          <input type="date" className={field} required value={off.endDate} onChange={(e) => setOff({ ...off, endDate: e.target.value })} />
          <Button type="submit" size="sm">Block those dates</Button>
        </form>
      )}
    </div>
  );
}
