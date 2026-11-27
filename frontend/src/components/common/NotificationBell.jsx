import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../../services/api";

export default function NotificationBell({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    api
      .get("/notifications")
      .then((res) => {
        setItems(res.data.data.items);
        setUnread(res.data.data.unread);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  const mark = async (item) => {
    if (!item.readAt) {
      await api.patch(`/notifications/${item.id}/read`).catch(() => {});
      setUnread((n) => Math.max(0, n - 1));
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className={`relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink-800 transition hover:bg-paper ${className}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">Notifications</p>
            <button
              className="text-xs font-bold text-brand-600"
              onClick={() => api.post("/notifications/read-all").then(load)}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-sm text-ink-700">No notifications yet.</p>}
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.link || "/dashboard"}
                onClick={() => mark(item)}
                className={`block border-b border-slate-50 px-4 py-3 text-left hover:bg-brand-50 ${item.readAt ? "" : "bg-brand-50/50"}`}
              >
                <p className="text-sm font-bold text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-ink-700">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
