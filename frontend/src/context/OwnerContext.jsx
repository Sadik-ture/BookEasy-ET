import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMyBusiness } from "../services/manageService";

const OwnerContext = createContext(null);

export function OwnerProvider({ children }) {
  const [state, setState] = useState({ status: "loading", business: null }); // loading | ready | none | error
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMyBusiness(controller.signal)
      .then((business) => setState({ status: "ready", business }))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        setState({ status: err.response?.status === 404 ? "none" : "error", business: null });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => {
    setState({ status: "loading", business: null });
    setReloadKey((k) => k + 1);
  }, []);
  const patch = useCallback((changes) => setState((s) => (s.business ? { ...s, business: { ...s.business, ...changes } } : s)), []);

  return <OwnerContext.Provider value={{ ...state, retry, patch }}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  return useContext(OwnerContext);
}