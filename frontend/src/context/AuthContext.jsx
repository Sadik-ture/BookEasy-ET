import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const applySession = (data) => {
    setUser(data.user);
    setMemberships(data.memberships || []);
  };

  // Check if we already have a valid session cookie
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => applySession(res.data.data))
      .catch(() => {
        setUser(null);
        setMemberships([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    applySession(res.data.data);
    return res.data.data.user;
  };

  const register = async (form) => {
    const res = await api.post("/auth/register", form);
    applySession(res.data.data);
    return res.data.data.user;
  };

  const refresh = async () => {
    const res = await api.get("/auth/me");
    applySession(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setMemberships([]);
    localStorage.removeItem("bookeasy_workspace");
  };

  return (
    <AuthContext.Provider value={{ user, memberships, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}