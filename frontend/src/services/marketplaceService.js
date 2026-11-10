import api from "./api";

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

// Returns { success, data: { items }, meta: { page, limit, total, totalPages } }
export async function fetchBusinesses(params, signal) {
  const res = await api.get("/businesses", { params: clean(params), signal });
  return res.data;
}

export async function fetchBusiness(slug, signal) {
  const res = await api.get(`/businesses/${encodeURIComponent(slug)}`, { signal });
  return res.data.data.business;
}

export async function fetchCategories(signal) {
  const res = await api.get("/categories", { signal });
  return res.data.data.categories;
}