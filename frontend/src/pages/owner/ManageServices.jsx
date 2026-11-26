import { useEffect, useState } from "react";
import { Clock, Pencil, Plus, Scissors, TriangleAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import FormField from "../../components/common/FormField";
import { TextAreaField } from "../../components/common/Field";
import { listManageServices, addService, updateService } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { formatDuration, formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

function ServiceForm({ initial, onSaved, onClose }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    priceBirr: initial ? String(initial.priceMinor / 100) : "",
    durationMinutes: initial ? String(initial.durationMinutes) : "30",
  });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFields({});
    try {
      if (editing) await updateService(initial.id, form);
      else await addService(form);
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
      <FormField label="Service name" placeholder="Haircut" value={form.name} onChange={set("name")} error={fields.name} required />
      <TextAreaField label="Description (optional)" rows={2} maxLength={300} value={form.description} onChange={set("description")} error={fields.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Price (ETB)" type="number" min="0" step="1" value={form.priceBirr} onChange={set("priceBirr")} error={fields.priceBirr} required />
        <FormField label="Duration (minutes)" type="number" min="5" max="480" step="5" value={form.durationMinutes} onChange={set("durationMinutes")} error={fields.durationMinutes} required />
      </div>
      {error && !Object.keys(fields).length && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={saving} className="flex-1">{editing ? "Save changes" : "Add service"}</Button>
      </div>
    </form>
  );
}

export default function ManageServices() {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState(null); // { item? }
  const [busyId, setBusyId] = useState("");
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();
    listManageServices(controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", items: [] });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const toggleActive = async (s) => {
    setBusyId(s.id);
    try {
      await updateService(s.id, { active: !s.active });
    } catch {
      /* the reload below shows the real state */
    } finally {
      setBusyId("");
      reload();
    }
  };

  const { status, items } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Services</h1>
          <p className="mt-1 text-slate-500">What customers can book. Hidden services can't be booked.</p>
        </div>
        <Button onClick={() => setModal({})}>
          <Plus size={16} /> Add service
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {status === "loading" && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load services</p>
            <Button variant="soft" className="mt-5" onClick={reload}>Try again</Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Scissors size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">No services yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Add your first service, for example "Haircut", so customers can book it.</p>
          </Card>
        )}

        {status === "ready" &&
          items.map((s) => (
            <Card key={s.id} className={cn("flex items-center gap-4 p-5", !s.active && "bg-slate-50")}>
              <div className="min-w-0 flex-1">
                <p className={cn("font-bold", s.active ? "text-ink-900" : "text-slate-400")}>{s.name}</p>
                {s.description && <p className="truncate text-sm text-slate-500">{s.description}</p>}
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock size={13} /> {formatDuration(s.durationMinutes)}
                </p>
              </div>
              <span className="font-extrabold text-ink-900">{formatPrice(s.priceMinor)}</span>
              <Switch checked={s.active} disabled={busyId === s.id} onChange={() => toggleActive(s)} label={`Show ${s.name}`} />
              <button onClick={() => setModal({ item: s })} aria-label={`Edit ${s.name}`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700">
                <Pencil size={17} />
              </button>
            </Card>
          ))}
      </div>

      {modal && (
        <Modal title={modal.item ? "Edit service" : "Add service"} onClose={() => setModal(null)}>
          <ServiceForm
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