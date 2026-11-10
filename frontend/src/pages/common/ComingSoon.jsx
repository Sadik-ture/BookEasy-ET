import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";

export default function ComingSoon({ title, message = "This page is being built in the next steps." }) {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <Sparkles size={28} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-2 text-slate-500">{message}</p>
      <Button as={Link} to="/" variant="soft" className="mt-8">
        Back to home
      </Button>
    </div>
  );
}