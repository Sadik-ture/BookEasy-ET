import { useEffect, useState } from "react";
import { Pencil, Plus, TriangleAlert, Users } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import FormField from "../../components/common/FormField";
import { listManageServices, listManageStaff, addStaff, updateStaff } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { cn } from "../../utils/cn";

function StaffForm({ services, initial, onSaved, onClose }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({ name: initial?.name || "", title: initial?.title || "", serviceIds: initial?.serviceIds || [] });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  const toggle = (id) =>
    setForm({ ...form, serviceIds: form.serviceIds.includes(id) ? form.serviceIds.filter((x) => x !== id) : [...form.serviceIds, id] });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFields({});
    try {
      if (editing) await updateStaff(initial.id, form);
      else await addStaff(form);
      onSaved();
    } catch (err) {
      const p = parseApiError(err);
      setError(p.message);
      setFields(p.fields);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormField label="Name" placeholder="Dawit Alemu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={fields.name} required />
      <FormField label="Title (optional)" placeholder="Senior Barber" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={fields.title} />

      <div>
        <p className="mb-2 text-sm font-semibold text-ink-800">Services this person performs</p>
        {services.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Add a service first, then come back to assign it.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const on = form.serviceIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  className={cn("rounded-full px-4 py-2 text-sm font-semibold ring-1 transition", on ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-brand-50")}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">Working hours follow your business opening hours.</p>

      {error && !Object.keys(fields).length && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={saving} className="flex-1">{editing ? "Save changes" : "Add staff member"}</Button>
      </div>
    </form>
  );
}

export default function ManageStaff() {
  const [state, setState] = useState({ status: "loading", staff: [], services: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState("");
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listManageStaff(controller.signal), listManageServices(controller.signal)])
      .then(([staff, services]) => setState({ status: "ready", staff, services }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", staff: [], services: [] });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const toggleActive = async (s) => {
    setBusyId(s.id);
    try {
      await updateStaff(s.id, { active: !s.active });
    } catch {
      /* the reload below shows the real state */
    } finally {
      setBusyId("");
      reload();
    }
  };

  const { status, staff, services } = state;
  const nameOf = (id) => services.find((s) => s.id === id)?.name;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Staff</h1>
          <p className="mt-1 text-slate-500">Customers pick a professional or choose "Any". Switch someone off to stop new bookings with them.</p>
        </div>
        <Button onClick={() => setModal({})}>
          <Plus size={16} /> Add staff
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {status === "loading" && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load staff</p>
            <Button variant="soft" className="mt-5" onClick={reload}>Try again</Button>
          </Card>
        )}

        {status === "ready" && staff.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Users size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">No staff yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Add yourself or your team so customers can choose a time.</p>
          </Card>
        )}

        {status === "ready" &&
          staff.map((s) => (
            <Card key={s.id} className={cn("flex items-center gap-4 p-5", !s.active && "bg-slate-50")}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-extrabold text-brand-700">{s.name.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-bold", s.active ? "text-ink-900" : "text-slate-400")}>
                  {s.name} {s.title && <span className="font-normal text-slate-500">· {s.title}</span>}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {s.serviceIds.length ? s.serviceIds.map(nameOf).filter(Boolean).join(", ") : "No services assigned yet"}
                </p>
              </div>
              <Switch checked={s.active} disabled={busyId === s.id} onChange={() => toggleActive(s)} label={`Accept bookings for ${s.name}`} />
              <button onClick={() => setModal({ item: s })} aria-label={`Edit ${s.name}`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700">
                <Pencil size={17} />
              </button>
            </Card>
          ))}
      </div>

      {modal && (
        <Modal title={modal.item ? "Edit staff member" : "Add staff member"} onClose={() => setModal(null)}>
          <StaffForm
            services={services}
            initial={modal.item}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              reload();
            }}
          />
        </Modal>
      )}
    </div>
  );
}