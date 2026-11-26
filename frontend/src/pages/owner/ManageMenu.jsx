import { useEffect, useState } from "react";
import { Pencil, Plus, TriangleAlert, UtensilsCrossed } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import FormField from "../../components/common/FormField";
import { SelectField, TextAreaField } from "../../components/common/Field";
import { getManageMenu, addCategory, addMenuItem, updateMenuItem } from "../../services/manageService";
import { parseApiError } from "../../utils/apiError";
import { formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

function ItemForm({ categories, initial, defaultCategoryId, onSaved, onClose }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    priceBirr: initial ? String(initial.priceMinor / 100) : "",
    categoryId: initial?.categoryId || defaultCategoryId || categories[0]?.id || "",
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
      const payload = { name: form.name, description: form.description, priceBirr: form.priceBirr, categoryId: form.categoryId };
      if (editing) await updateMenuItem(initial.id, payload);
      else await addMenuItem(payload);
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
      <FormField label="Name" placeholder="Injera with Tibs" value={form.name} onChange={set("name")} error={fields.name} required />
      <TextAreaField label="Description (optional)" rows={2} maxLength={200} value={form.description} onChange={set("description")} error={fields.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Price (ETB)" type="number" min="0" step="1" value={form.priceBirr} onChange={set("priceBirr")} error={fields.priceBirr} required />
        <SelectField label="Category" value={form.categoryId} onChange={set("categoryId")} error={fields.categoryId}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
      </div>
      {error && !Object.keys(fields).length && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={saving} className="flex-1">{editing ? "Save changes" : "Add item"}</Button>
      </div>
    </form>
  );
}

export default function ManageMenu() {
  const [state, setState] = useState({ status: "loading", categories: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [catName, setCatName] = useState("");
  const [catError, setCatError] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [modal, setModal] = useState(null); // { item?, categoryId? }
  const [busyId, setBusyId] = useState("");
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();
    getManageMenu(controller.signal)
      .then((categories) => setState({ status: "ready", categories }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "error", categories: [] });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const submitCategory = async (e) => {
    e.preventDefault();
    setAddingCat(true);
    setCatError("");
    try {
      await addCategory(catName);
      setCatName("");
      reload();
    } catch (err) {
      const p = parseApiError(err);
      setCatError(p.fields.name || p.message);
    } finally {
      setAddingCat(false);
    }
  };

  const toggleAvailable = async (item) => {
    setBusyId(item.id);
    try {
      await updateMenuItem(item.id, { available: !item.available });
    } catch {
      /* the reload below shows the real state */
    } finally {
      setBusyId("");
      reload();
    }
  };

  const { status, categories } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Menu</h1>
      <p className="mt-1 text-slate-500">Hidden items stay in your menu but customers can't order them.</p>

      <Card className="mt-6 p-5">
        <form onSubmit={submitCategory} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <FormField label="New category" placeholder="Drinks, Breakfast, Specials…" value={catName} onChange={(e) => setCatName(e.target.value)} error={catError} />
          </div>
          <Button type="submit" loading={addingCat} disabled={!catName.trim()} className="sm:mt-[1.75rem]">
            <Plus size={16} /> Add category
          </Button>
        </form>
      </Card>

      <div className="mt-6 space-y-6">
        {status === "loading" && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />)}

        {status === "error" && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TriangleAlert size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Couldn't load your menu</p>
            <Button variant="soft" className="mt-5" onClick={reload}>Try again</Button>
          </Card>
        )}

        {status === "ready" && categories.length === 0 && (
          <Card className="grid place-items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-accent-600"><UtensilsCrossed size={24} /></span>
            <p className="mt-4 font-bold text-ink-900">Start your menu</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Add a category above, for example "Traditional Dishes", then add your dishes to it.</p>
          </Card>
        )}

        {status === "ready" &&
          categories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-extrabold text-ink-900">{cat.name}</h2>
                <Button size="sm" variant="soft" onClick={() => setModal({ categoryId: cat.id })}>
                  <Plus size={15} /> Add item
                </Button>
              </div>
              {cat.items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No items in this category yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {cat.items.map((item) => (
                    <li key={item.id} className={cn("flex items-center gap-4 px-5 py-4", !item.available && "bg-slate-50")}>
                      <div className="min-w-0 flex-1">
                        <p className={cn("font-bold", item.available ? "text-ink-900" : "text-slate-400")}>{item.name}</p>
                        {item.description && <p className="truncate text-sm text-slate-500">{item.description}</p>}
                      </div>
                      <span className="font-extrabold text-ink-900">{formatPrice(item.priceMinor)}</span>
                      <div className="flex items-center gap-2" title={item.available ? "Visible to customers" : "Hidden"}>
                        <Switch checked={item.available} disabled={busyId === item.id} onChange={() => toggleAvailable(item)} label={`Show ${item.name}`} />
                      </div>
                      <button
                        onClick={() => setModal({ item: { ...item, categoryId: cat.id } })}
                        aria-label={`Edit ${item.name}`}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                      >
                        <Pencil size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
      </div>

      {modal && (
        <Modal title={modal.item ? "Edit item" : "Add menu item"} onClose={() => setModal(null)}>
          <ItemForm
            categories={categories}
            initial={modal.item}
            defaultCategoryId={modal.categoryId}
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