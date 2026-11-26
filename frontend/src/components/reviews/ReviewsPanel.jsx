import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { parseApiError } from "../../utils/apiError";

export default function ReviewsPanel({ slug }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [eligible, setEligible] = useState({ bookings: [], orders: [] });
  const [choice, setChoice] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.get(`/businesses/${slug}/reviews`).then((res) => setItems(res.data.data.items)).catch(() => {});
    if (user) {
      api.get("/reviews/eligible", { params: { slug } }).then((res) => setEligible(res.data.data)).catch(() => {});
    }
  };

  useEffect(() => { load(); }, [slug, user]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const [kind, id] = choice.split(":");
    try {
      await api.post("/reviews", {
        rating: Number(rating),
        comment,
        ...(kind === "booking" ? { bookingId: id } : { orderId: id }),
      });
      setMessage("Thanks, your review is published.");
      setComment("");
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const options = [
    ...eligible.bookings.map((b) => ({ value: `booking:${b.id}`, label: b.label })),
    ...eligible.orders.map((o) => ({ value: `order:${o.id}`, label: o.label })),
  ];

  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-sm text-slate-500">No published reviews yet.</p>}
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold">{r.customerName} · {r.rating}/5</p>
          {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
          {r.reply && <p className="mt-2 text-sm text-brand-700">Business: {r.reply}</p>}
        </div>
      ))}
      {user && options.length > 0 && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold">Review a completed visit</p>
          <select className="h-11 w-full rounded-xl border px-3 text-sm" value={choice} onChange={(e) => setChoice(e.target.value)} required>
            <option value="">Choose a visit</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="h-11 w-full rounded-xl border px-3 text-sm" value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
          <textarea className="h-20 w-full rounded-xl border px-3 py-2 text-sm" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was it?" />
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" size="sm">Publish review</Button>
        </form>
      )}
      {!user && <Button as={Link} to="/login" variant="soft" size="sm">Sign in to review</Button>}
    </div>
  );
}
