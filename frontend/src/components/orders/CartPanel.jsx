import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CircleAlert, Phone, QrCode, ShoppingBag, Store } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import QtyStepper from "./QtyStepper";
import FormField from "../common/FormField";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import { parseApiError } from "../../utils/apiError";
import { formatPrice } from "../../utils/format";

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// table: { code, label } when the customer scanned a table QR code, otherwise null
export default function CartPanel({ business, table, onStale, onTableInvalid }) {
  const { user } = useAuth();
  const { cart, setQty, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState("cart"); // cart | checkout | done
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const requestId = useRef(newId()); // stays the same for retries of the same order

  const lines = cart.businessId === business.id ? cart.lines : [];
  const total = lines.reduce((sum, l) => sum + l.priceMinor * l.quantity, 0);
  const closed = business.isOpen === false;

  const goCheckout = () => {
    if (!user) {
      // Keep the full address (including ?table=...) so we come back to the same table
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    setError("");
    setFields({});
    setStep("checkout");
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setError("");
    setFields({});
    try {
      const order = await createOrder({
        businessId: business.id,
        items: lines.map((l) => ({ menuItemId: l.id, quantity: l.quantity })),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        tableCode: table?.code,
        clientRequestId: requestId.current,
      });
      setPlaced(order);
      clear();
      requestId.current = newId();
      setStep("done");
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFields(parsed.fields);
      if (err.response?.status === 409) {
        setStep("cart");
        onStale?.(); // reload the menu so prices and availability are current
        if (err.response?.data?.error?.code === "TABLE_INVALID") onTableInvalid?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Success ----------
  if (step === "done" && placed) {
    const dineIn = placed.type === "dine_in";
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
          <Check size={30} />
        </span>
        <h3 className="mt-5 text-xl font-extrabold text-ink-900">Order placed!</h3>
        <p className="mt-1 text-sm text-slate-500">{placed.business?.name} has received your order.</p>

        <div className="mt-5 rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Order number</p>
          <p className="mt-1 text-2xl font-extrabold tracking-wide text-ink-900">{placed.orderNumber}</p>
          {dineIn && <p className="mt-1 text-sm font-bold text-brand-700">{placed.tableLabel}</p>}
        </div>

        <ul className="mt-5 space-y-2 text-left text-sm">
          {placed.items.map((i) => (
            <li key={i.name} className="flex justify-between gap-3">
              <span className="text-slate-600">
                {i.quantity} × {i.name}
              </span>
              <span className="font-semibold text-ink-900">{formatPrice(i.lineTotalMinor)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold text-ink-900">
            <span>Total</span>
            <span>{formatPrice(placed.totalMinor, placed.currency)}</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          {dineIn
            ? `Dine-in at ${placed.tableLabel}. Staff will bring your order to your table. Pay at the restaurant.`
            : "Takeaway. Pay at the restaurant when you pick up."}
        </p>

        <div className="mt-6 flex gap-3">
          <Button as={Link} to="/my-orders" className="flex-1">
            Track order
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setPlaced(null);
              setNotes("");
              setStep("cart");
            }}
          >
            Order more
          </Button>
        </div>
      </Card>
    );
  }

  // ---------- Cart / Checkout ----------
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <ShoppingBag size={20} className="text-brand-600" /> Your Order
        </h3>
        {lines.length > 0 && step === "cart" && (
          <button onClick={clear} className="text-xs font-bold text-slate-400 hover:text-rose-600">
            Clear
          </button>
        )}
      </div>

      {table && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
          <QrCode size={14} /> Dine-in · {table.label}
        </p>
      )}

      {closed && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <Store size={16} className="mt-0.5 shrink-0" /> Closed right now. You can look at the menu, but ordering opens when{" "}
          {business.name} does.
        </p>
      )}

      {lines.length === 0 ? (
        <div className="grid place-items-center py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ShoppingBag size={24} />
          </span>
          <p className="mt-4 font-bold text-ink-900">Your order is empty</p>
          <p className="mt-1 max-w-[16rem] text-sm text-slate-500">Add dishes from the menu and they will show up here.</p>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-slate-100">
            {lines.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900">{l.name}</p>
                    <p className="text-xs text-slate-500">{formatPrice(l.priceMinor)} each</p>
                  </div>
                  <span className="font-extrabold text-ink-900">{formatPrice(l.priceMinor * l.quantity)}</span>
                </div>
                {step === "cart" && (
                  <div className="mt-2">
                    <QtyStepper small value={l.quantity} onChange={(n) => setQty(l.id, n)} />
                  </div>
                )}
                {step === "checkout" && <p className="mt-1 text-sm text-slate-500">Quantity: {l.quantity}</p>}
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-base font-bold text-ink-900">Total</span>
            <span className="text-2xl font-extrabold text-ink-900">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <CircleAlert size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          {step === "cart" && (
            <Button size="lg" className="mt-5 w-full" onClick={goCheckout} disabled={closed}>
              {user ? "Checkout" : "Log in to order"}
            </Button>
          )}

          {step === "checkout" && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-bold text-ink-900">{table ? `Dine-in · ${table.label}` : "Takeaway"}</p>
                <p className="text-slate-500">
                  {table ? "Staff will bring your order to your table. Pay at the restaurant." : "Pay at the restaurant when you pick up."}
                </p>
              </div>

              <FormField
                label="Phone number"
                type="tel"
                icon={Phone}
                autoComplete="tel"
                placeholder="+251 9XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fields.phone}
              />

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-800">Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Less spicy, extra injera…"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("cart")} disabled={submitting}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button className="flex-1" size="lg" loading={submitting} onClick={placeOrder}>
                  {submitting ? "Placing…" : `Place order · ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}