import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormField from "../../components/common/FormField";
import { parseApiError } from "../../utils/apiError";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.patch("/auth/me", { fullName, phone });
      await refresh();
      setMessage("Profile saved.");
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-extrabold">Profile</h1>
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <Card className="p-6">
        <form onSubmit={saveProfile} className="space-y-4">
          <FormField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <FormField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <p className="text-sm text-slate-500">{user.email}</p>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
      <Card className="p-6">
        <form onSubmit={savePassword} className="space-y-4">
          <FormField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <FormField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" variant="dark">Change password</Button>
        </form>
      </Card>
    </div>
  );
}
