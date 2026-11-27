import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { formatPrice } from "../../utils/format";
import { parseApiError } from "../../utils/apiError";

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function TableOrder() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [lines, setLines] = useState([]);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(null);
  const requestId = useRef(newId());

  useEffect(() => {
    api.get(`/tables/${token}`).then((res) => setData(res.data.data)).catch(() => setError("This table code is not active."));
  }, [token]);

  const add = (item) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) return prev.map((l) => (l.id === item.id ? { ...l, quantity: Math.min(20, l.quantity + 1) } : l));
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const submit = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/t/${token}` } });
      return;
    }
    if (!data?.business.acceptingRequests) {
      setError("This restaurant is not taking orders right now.");
      return;
    }
    setError("");
    try {
      const res = await api.post("/orders", {
        businessId: data.business.id,
        type: "dine_in",
        qrToken: token,
        items: lines.map((l) => ({ menuItemId: l.id, quantity: l.quantity })),
        notes: notes.trim() || undefined,
        clientRequestId: requestId.current,
      });
      setDone(res.data.data.order);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  if (error && !data) return <p className="px-4 py-16 text-center text-ink-700">{error}</p>;
  if (!data) return <div className="mx-auto mt-10 h-40 max-w-lg animate-pulse rounded-3xl bg-surface" />;
  if (done) {
    return (
      <Card className="mx-auto mt-10 max-w-lg p-6 text-center">
        <h1 className="text-2xl font-extrabold">Order sent to the kitchen</h1>
        <p className="mt-2 text-sm text-ink-700">{done.orderNumber}. Pay at the table. This is not marked paid.</p>
        <p className="mt-2 text-sm">{done.collectionNote}</p>
        <Button as={Link} to="/my-orders" className="mt-6">Track order</Button>
      </Card>
    );
  }

  const total = lines.reduce((n, l) => n + l.priceMinor * l.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-bold text-brand-600">Table {data.table.label}</p>
      <h1 className="text-3xl font-extrabold">{data.business.name}</h1>
      <p className="mt-1 text-sm text-ink-700">You need a connection to send this order. It is not saved offline.</p>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <div className="mt-6 space-y-6">
        {data.categories.map((c) => (
          <section key={c.id}>
            <h2 className="font-extrabold">{c.name}</h2>
            <div className="mt-2 space-y-2">
              {c.items.map((item) => (
                <Card key={item.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-ink-700">{formatPrice(item.priceMinor)}</p>
                  </div>
                  <Button size="sm" variant="soft" onClick={() => add(item)}>Add</Button>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      {lines.length > 0 && (
        <Card className="mt-6 p-4">
          {lines.map((l) => (
            <div key={l.id} className="flex justify-between text-sm">
              <span>{l.quantity} × {l.name}</span>
              <button className="text-rose-600" onClick={() => setLines(lines.filter((x) => x.id !== l.id))}>Remove</button>
            </div>
          ))}
          <textarea className="mt-3 h-20 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Notes for the kitchen" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button className="mt-3 w-full" onClick={submit}>Send order · {formatPrice(total)}</Button>
        </Card>
      )}
    </div>
  );
}
