import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Logo from "./Logo";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/businesses?category=barbershop", label: "Barbershops" },
      { to: "/businesses?category=salon", label: "Beauty Salons" },
      { to: "/businesses?category=restaurant", label: "Restaurants" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/signup", label: "List your business" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Sign Up" },
    ],
  },
];

export default function Footer() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.data.database === "connected" ? "online" : "db-down"))
      .catch(() => setStatus("offline"));
  }, []);

  const badge = {
    checking: { text: "Checking server…", color: "bg-slate-400" },
    online: { text: "All systems online", color: "bg-emerald-400" },
    "db-down": { text: "Database disconnected", color: "bg-amber-400" },
    offline: { text: "Server offline", color: "bg-rose-400" },
  }[status];

  return (
    <footer className="bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              One marketplace for barbershops, beauty salons and restaurants in Ethiopia. Book.
              Order. Skip the wait.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/60 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} BookEasy ET. All rights reserved.</p>
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${badge.color}`} />
            {badge.text}
          </span>
        </div>
      </div>
    </footer>
  );
}