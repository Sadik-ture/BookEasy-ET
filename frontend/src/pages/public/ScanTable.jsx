import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { QrCode } from "lucide-react";
import Button from "../../components/ui/Button";
import { fetchTable } from "../../services/marketplaceService";

export default function ScanTable() {
  const { code } = useParams();
  const [state, setState] = useState({ status: "loading", slug: "" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", slug: "" });
    fetchTable(code, controller.signal)
      .then((info) => setState({ status: "ready", slug: info.business.slug }))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setState({ status: "invalid", slug: "" });
      });
    return () => controller.abort();
  }, [code]);

  // Valid code: open that restaurant's menu with the table attached
  if (state.status === "ready") {
    return <Navigate to={`/business/${state.slug}?table=${encodeURIComponent(code)}`} replace />;
  }

  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <QrCode size={28} />
      </span>
      {state.status === "loading" ? (
        <>
          <h1 className="mt-5 text-2xl font-extrabold text-ink-900">Opening the menu…</h1>
          <p className="mt-1 text-slate-500">One moment.</p>
        </>
      ) : (
        <>
          <h1 className="mt-5 text-2xl font-extrabold text-ink-900">This QR code isn't valid</h1>
          <p className="mt-1 text-slate-500">It may have been replaced or switched off. Please ask the staff for help.</p>
          <Button as={Link} to="/businesses?category=restaurant" variant="soft" className="mt-6">
            Browse restaurants
          </Button>
        </>
      )}
    </div>
  );
}