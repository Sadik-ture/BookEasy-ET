import { useEffect, useState } from "react";
import api from "../../services/api";
import Logo from "./Logo";

export default function Footer() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.data.database === "connected" ? "online" : "db-down"))
      .catch(() => setStatus("offline"));
  }, []);

  const badge = {
    checking: { text: "Checking server…", color: "bg-slate-300" },
    online: { text: "Server online", color: "bg-green-500" },
    "db-down": { text: "Database disconnected", color: "bg-amber-500" },
    offline: { text: "Server offline", color: "bg-red-500" },
  }[status];

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} BookEasy ET. Book. Order. Skip the wait.</p>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${badge.color}`} />
          {badge.text}
        </span>
      </div>
    </footer>
  );
}