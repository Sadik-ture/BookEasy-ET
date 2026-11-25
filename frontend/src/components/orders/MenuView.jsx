import { useState } from "react";
import { Plus, Utensils } from "lucide-react";
import Button from "../ui/Button";
import QtyStepper from "./QtyStepper";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function MenuView({ business, categories }) {
  const { cart, add, setQty } = useCart();
  const [active, setActive] = useState("all");

  const qtyOf = (id) => (cart.businessId === business.id ? cart.lines.find((l) => l.id === id)?.quantity || 0 : 0);
  const visible = active === "all" ? categories : categories.filter((c) => c.id === active);
  const chips = [{ id: "all", name: "All" }, ...categories];

  return (
    <div>
      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-3">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
              active === c.id
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-brand-50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {visible.map((cat) => (
          <section key={cat.id}>
            <h3 className="px-1 text-sm font-bold uppercase tracking-wider text-slate-400">{cat.name}</h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {cat.items.map((item) => {
                const qty = qtyOf(item.id);
                return (
                  <li key={item.id} className="flex items-center gap-4 px-1 py-3.5">
                    <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white">
                      <Utensils size={28} className="opacity-80" />
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink-900">{item.name}</p>
                      {item.description && <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>}
                      <p className="mt-1 font-extrabold text-ink-900">{formatPrice(item.priceMinor)}</p>
                    </div>

                    {qty > 0 ? (
                      <QtyStepper value={qty} onChange={(n) => setQty(item.id, n)} />
                    ) : (
                      <Button size="sm" onClick={() => add(business, item)}>
                        Add <Plus size={15} />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}