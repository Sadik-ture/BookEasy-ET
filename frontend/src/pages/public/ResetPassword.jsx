import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import AuthShell from "../../components/common/AuthShell";
import FormField from "../../components/common/FormField";
import Button from "../../components/ui/Button";
import { parseApiError } from "../../utils/apiError";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/reset-password", { token: params.get("token") || "", password });
      setMessage(res.data.data.message);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" subtitle="This link works once." footer={<Link to="/login" className="font-bold text-brand-600">Sign in</Link>}>
      <form onSubmit={submit} className="space-y-5">
        <FormField label="New password" type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>Update password</Button>
      </form>
    </AuthShell>
  );
}
