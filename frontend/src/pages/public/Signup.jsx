import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { parseApiError } from "../../utils/apiError";
import AuthShell from "../../components/common/AuthShell";
import FormField from "../../components/common/FormField";
import Button from "../../components/ui/Button";

export default function Signup() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFields({});
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFields(parsed.fields);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Book services and order food in a few taps."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Getachew Alemu"
          value={form.fullName}
          onChange={update("fullName")}
          error={fields.fullName}
          required
        />
        <FormField
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          error={fields.email}
          required
        />
        <FormField
          label="Phone (optional)"
          type="tel"
          icon={Phone}
          autoComplete="tel"
          placeholder="+251 9XX XXX XXX"
          value={form.phone}
          onChange={update("phone")}
          error={fields.phone}
        />
        <FormField
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={update("password")}
          error={fields.password}
          required
        />

        {error && !Object.keys(fields).length && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
        )}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? "Creating account…" : "Sign up"}
        </Button>
      </form>
    </AuthShell>
  );
}