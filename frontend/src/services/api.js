import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const token = readCookie("bookeasy_csrf");
    if (token) config.headers["x-csrf-token"] = token;
  }
  if (typeof config.url === "string" && config.url.startsWith("/workspace")) {
    const businessId = localStorage.getItem("bookeasy_workspace");
    if (businessId) config.headers["x-business-id"] = businessId;
  }
  return config;
});

export default api;