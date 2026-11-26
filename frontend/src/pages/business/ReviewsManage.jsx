import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function ReviewsManage() {
  const [items, setItems] = useState([]);
  const [reply, setReply] = useState({});

  const load = () => api.get("/workspace/reviews").then((res) => setItems(res.data.data.items));
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-3xl font-extrabold">Reviews</h1>
      {items.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
      {items.map((r) => (
        <Card key={r._id} className="p-4">
          <p className="font-bold">{r.rating} / 5 {r.hidden ? "· hidden" : ""}</p>
          <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
          {r.reply && <p className="mt-2 text-sm text-brand-700">Reply: {r.reply}</p>}
          {!r.hidden && (
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); api.patch(`/workspace/reviews/${r._id}/reply`, { reply: reply[r._id] || "" }).then(load); }}>
              <input className="h-11 flex-1 rounded-xl border px-3 text-sm" placeholder="Reply" value={reply[r._id] || ""} onChange={(e) => setReply({ ...reply, [r._id]: e.target.value })} />
              <Button type="submit" size="sm">Reply</Button>
            </form>
          )}
        </Card>
      ))}
    </div>
  );
}
