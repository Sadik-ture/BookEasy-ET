import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ExternalLink, Pencil, Plus, Printer, QrCode, RefreshCw, TriangleAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import FormField from "../../components/common/FormField";
import { useOwner } from "../../context/OwnerContext";
import { listTables, addTables, updateTable, rotateTable } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { cn } from "../../utils/cn";

// The address inside every QR code
const urlFor = (code) => `${window.location.origin}/t/${code}`;

function RenameForm({ table, onSaved, onClose }) {
  const [label, setLabel] = useState(table.label);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateTable(table.id, { label });
      onSaved();
    } catch (err) {
      const p = parseApiError(err);
      setError(p.fields.label || p.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormField label="Table name" placeholder="Terrace 1" value={label} onChange={(e) => setLabel(e.target.value)} error={error} required />
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={saving} className="flex-1">Save</Button>
      </div>
    </form>
  );
}

export default function ManageTables() {
  const { business } = useOwner();
  const [state, setState] = useState({ status: "loading", items: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [count, setCount] = useState("5");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();
    listTables(controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", items: [] });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const submitAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      await addTables(count);
      reload();
    } catch (err) {
      const p = parseApiError(err);
      setAddError(p.fields.count || p.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (t) => {
    setBusyId(t.id);
    setNotice("");
    try {
      await updateTable(t.id, { active: !t.active });
    } catch (err) {
      setNotice(parseApiError(err).message);
    } finally {
      setBusyId("");
      reload();
    }
  };

  const rotate = async (t) => {
    if (!window.confirm(`Create a new QR code for ${t.label}? The printed one will stop working.`)) return;
    setBusyId(t.id);
    setNotice("");
    try {
      await rotateTable(t.id);
    } catch (err) {
      setNotice(parseApiError(err).message);
    } finally {
      setBusyId("");
      reload();
    }
  };

  const copy = async (t) => {
    try {
      await navigator.clipboard.writeText(urlFor(t.code));
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setNotice("Couldn't copy the link. Use the Open button and copy it from the address bar.");
    }
  };

  const { status, items } = state;
  const active = items.filter((t) => t.active);
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Table QR codes</h1>
          <p className="mt-1 text-slate-500">Guests scan the code at their table, see your menu and order. You'll see the table on every order.</p>
        </div>
        <Button onClick={() => window.print()} disabled={active.length === 0}>
          <Printer size={16} /> Print QR codes
        </Button>
      </div>

      {isLocal && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          You're on localhost, so these QR codes only work on this computer. To test with a phone, open this dashboard through your
          computer's network address. Before printing for real, use your real website address.
        </p>
      )}

      <Card className="mt-6 p-5">
        <form onSubmit={submitAdd} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="sm:w-64">
            <FormField label="How many tables to add?" type="number" min="1" max="50" value={count} onChange={(e) => setCount(e.target.value)} error={addError} />
          </div>
          <Button type="submit" loading={adding} disabled={!count} className="sm:mt-[1.75rem]">
            <Plus size={16} /> Add tables
          </Button>
        </form>
        <p className="mt-3 text-xs text-slate-500">Tables are named Table 1, Table 2 and so on. You can rename any of them afterwards.</p>
      </Card>

      {notice && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{notice}</p>}

      <div className="mt-6">
        {status === "loading" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        )}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load your tables</p>
            <Button variant="soft" className="mt-5" onClick={reload}>Try again</Button>
          </Card>
        )}

        {status === "ready" && items.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><QrCode size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">No tables yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Add your tables above and each one gets its own QR code to print.</p>
          </Card>
        )}

        {status === "ready" && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((t) => (
              <Card key={t.id} className={cn("p-5", !t.active && "bg-slate-50")}>
                <div className="flex items-start gap-4">
                  <div className={cn("shrink-0 rounded-2xl bg-white p-2 ring-1 ring-slate-200", !t.active && "opacity-40")}>
                    <QRCodeSVG value={urlFor(t.code)} size={88} level="M" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-extrabold text-ink-900">{t.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{t.active ? "Accepting orders" : "Switched off"}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Switch checked={t.active} disabled={busyId === t.id} onChange={() => toggleActive(t)} label={`Accept orders at ${t.label}`} />
                      <span className="text-xs font-medium text-slate-500">Active</span>
                    </div>
                  </div>
                  <button onClick={() => setModal({ table: t })} aria-label={`Rename ${t.label}`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700">
                    <Pencil size={17} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button as="a" href={urlFor(t.code)} target="_blank" rel="noreferrer" size="sm" variant="soft">
                    <ExternalLink size={14} /> Open
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copy(t)}>
                    {copiedId === t.id ? <Check size={14} /> : <Copy size={14} />} {copiedId === t.id ? "Copied" : "Copy link"}
                  </Button>
                  <Button size="sm" variant="ghost" loading={busyId === t.id} onClick={() => rotate(t)}>
                    <RefreshCw size={14} /> New QR
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Rename table" onClose={() => setModal(null)}>
          <RenameForm
            table={modal.table}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              reload();
            }}
          />
        </Modal>
      )}

      {/* Print sheet: invisible on screen, the only thing printed */}
      {status === "ready" &&
        active.length > 0 &&
        createPortal(
          <div className="print-root">
            <div className="grid grid-cols-2 gap-6">
              {active.map((t) => (
                <div key={t.id} className="break-inside-avoid rounded-2xl border-2 border-slate-900 p-6 text-center">
                  <p className="text-lg font-bold">{business.name}</p>
                  <p className="mt-1 text-sm">Scan to see the menu and order</p>
                  <div className="mx-auto mt-4 w-fit bg-white p-2">
                    <QRCodeSVG value={urlFor(t.code)} size={200} level="M" />
                  </div>
                  <p className="mt-4 text-3xl font-extrabold">{t.label}</p>
                  <p className="mt-1 text-xs">BookEasy ET</p>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}