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
      { to: "/list-your-business", label: "List your business" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Sign up" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
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
    checking: { text: "Checking server…", color: "bg-ink-700/40" },
    online: { text: "All systems online", color: "bg-brand-600" },
    "db-down": { text: "Database disconnected", color: "bg-accent-500" },
    offline: { text: "Server offline", color: "bg-rose-500" },
  }[status];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-700">
              Barbershops, salons, and restaurants in Addis Ababa. Book a chair or order a table without the wait.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-ink-800 transition hover:text-brand-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-700 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} BookEasy ET</p>
          <span className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${badge.color}`} />
            {badge.text}
          </span>
        </div>
      </div>
    </footer>
  );
}
