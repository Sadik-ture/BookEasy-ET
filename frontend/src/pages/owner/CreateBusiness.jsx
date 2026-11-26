import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Phone, MapPin, Store, Check } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormField from "../../components/common/FormField";
import { TextAreaField } from "../../components/common/Field";
import { useAuth } from "../../context/AuthContext";
import { createMyBusiness } from "../../services/manageService";
import { CATEGORIES } from "../../utils/categories";
import { parseApiError } from "../../utils/apiError";
import { cn } from "../../utils/cn";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CreateBusiness() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: "barbershop",
    name: "",
    phone: "",
    area: "",
    addressLine: "",
    description: "",
    openTime: "08:00",
    closeTime: "20:00",
    closedDays: [],
  });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Owners go straight to their dashboard
  if (user?.role === "business_owner") return <Navigate to="/manage" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggleDay = (d) =>
    setForm({ ...form, closedDays: form.closedDays.includes(d) ? form.closedDays.filter((x) => x !== d) : [...form.closedDays, d] });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setFields({});
    try {
      await createMyBusiness(form);
      // Full reload so the app picks up your new "owner" role
      window.location.assign("/manage");
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFields(parsed.fields);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">List your business</h1>
      <p className="mt-1 text-slate-500">Create your page on BookEasy ET. It takes about a minute.</p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <Card className="p-6">
          <h2 className="font-extrabold text-ink-900">What kind of business is it?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                onClick={() => setForm({ ...form, category: c.key })}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl p-4 ring-1 transition",
                  form.category === c.key ? "bg-brand-50 text-brand-700 ring-2 ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-brand-50/50"
                )}
              >
                <c.icon size={26} />
                <span className="text-sm font-bold">{c.label.replace(/s$/, "")}</span>
              </button>
            ))}
          </div>
          {fields.category && <p className="mt-2 text-xs font-medium text-rose-600">{fields.category}</p>}
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-extrabold text-ink-900">Business details</h2>
          <FormField label="Business name" icon={Store} placeholder="Royal Cuts Barber Shop" value={form.name} onChange={set("name")} error={fields.name} required />
          <FormField label="Phone (optional)" type="tel" icon={Phone} placeholder="+251 9XX XXX XXX" value={form.phone} onChange={set("phone")} error={fields.phone} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Area" icon={MapPin} placeholder="Bole" value={form.area} onChange={set("area")} error={fields.area} required />
            <FormField label="Street or landmark (optional)" placeholder="Bole Road, near…" value={form.addressLine} onChange={set("addressLine")} error={fields.addressLine} />
          </div>
          <TextAreaField label="Short description (optional)" rows={3} maxLength={1000} placeholder="What makes your business special?" value={form.description} onChange={set("description")} error={fields.description} />
        </Card>

        <Card className="p-6">
          <h2 className="font-extrabold text-ink-900">Opening hours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Opens" type="time" value={form.openTime} onChange={set("openTime")} error={fields.openTime} required />
            <FormField label="Closes" type="time" value={form.closeTime} onChange={set("closeTime")} error={fields.closeTime} required />
          </div>
          <p className="mt-5 text-sm font-semibold text-ink-800">Closed on</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((d, i) => {
              const closed = form.closedDays.includes(i);
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                    closed ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-brand-50"
                  )}
                >
                  {closed && <Check size={14} />} {d}
                </button>
              );
            })}
          </div>
          {fields.closedDays && <p className="mt-2 text-xs font-medium text-rose-600">{fields.closedDays}</p>}
        </Card>

        {error && !Object.keys(fields).length && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? "Creating…" : "Create my business"}
        </Button>
      </form>
    </div>
  );
}