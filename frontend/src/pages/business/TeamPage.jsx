import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { parseApiError } from "../../utils/apiError";

const field = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

export default function TeamPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", role: "receptionist" });
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/workspace/team").then((res) => setItems(res.data.data.items));
  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    setError("");
    setInviteUrl("");
    try {
      const res = await api.post("/workspace/team", form);
      setInviteUrl(res.data.data.inviteUrl || "");
      setForm({ fullName: "", email: "", role: "receptionist" });
      load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Team</h1>
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {inviteUrl && <p className="mt-4 break-all rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Share this password link once: {inviteUrl}</p>}
      <form onSubmit={invite} className="mt-6 grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <select className={field} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {["manager", "receptionist", "staff", "kitchen"].map((role) => <option key={role}>{role}</option>)}
        </select>
        <Button type="submit">Invite</Button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((m) => (
          <Card key={m.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">{m.user?.fullName}</p>
              <p className="text-sm text-slate-500">{m.user?.email} · {m.role} · {m.status}</p>
            </div>
            {m.role !== "owner" && m.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => api.patch(`/workspace/team/${m.id}`, { status: "removed" }).then(load)}>Remove</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
