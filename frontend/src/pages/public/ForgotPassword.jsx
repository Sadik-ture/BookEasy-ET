import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AuthShell from "../../components/common/AuthShell";
import FormField from "../../components/common/FormField";
import Button from "../../components/ui/Button";
import { parseApiError } from "../../utils/apiError";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.data.message);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="We will email a link if the account exists." footer={<Link to="/login" className="font-bold text-brand-600">Back to login</Link>}>
      <form onSubmit={submit} className="space-y-5">
        <FormField label="Email" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
        {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
      </form>
    </AuthShell>
  );
}
