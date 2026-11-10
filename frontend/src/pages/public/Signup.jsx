import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { parseApiError } from "../../utils/apiError";
import FormField from "../../components/common/FormField";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    <div className="bg-gradient-to-br from-brand-100 via-white to-brand-50 px-4 py-14">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-brand-600/10 ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Book services and order food in a few taps.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            label="Full name"
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
            autoComplete="tel"
            placeholder="+251 9XX XXX XXX"
            value={form.phone}
            onChange={update("phone")}
            error={fields.phone}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update("password")}
            error={fields.password}
            required
          />

          {error && !Object.keys(fields).length && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}