import { Navigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/ui/Button";
import { OwnerProvider, useOwner } from "../context/OwnerContext";

function Inner() {
  const { status, retry } = useOwner();

  if (status === "loading") return <div className="grid min-h-screen place-items-center text-slate-500">Loading your business…</div>;
  if (status === "none") return <Navigate to="/list-your-business" replace />;
  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <TriangleAlert size={24} />
          </span>
          <p className="mt-4 font-bold text-ink-900">Couldn't load your business</p>
          <Button variant="soft" className="mt-5" onClick={retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
  return <DashboardLayout variant="owner" />;
}

// Wrap pages that only make sense for one type of business
export function OnlyFor({ restaurant, children }) {
  const { business } = useOwner();
  const isRestaurant = business.category === "restaurant";
  return isRestaurant === restaurant ? children : <Navigate to="/manage" replace />;
}

export default function OwnerGuard() {
  return (
    <OwnerProvider>
      <Inner />
    </OwnerProvider>
  );
}