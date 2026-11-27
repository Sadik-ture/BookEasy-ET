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

export async function fetchServices(slug, signal) {
  const res = await api.get(`/businesses/${encodeURIComponent(slug)}/services`, { signal });
  return res.data.data.items;
}

export async function fetchStaff(slug, signal) {
  const res = await api.get(`/businesses/${encodeURIComponent(slug)}/staff`, { signal });
  return res.data.data.items;
}

// Returns { date, timezone, message, slots: [{ time, startAt }] }
export async function fetchAvailability({ slug, serviceId, date, staffId }, signal) {
  const res = await api.get(`/businesses/${encodeURIComponent(slug)}/availability`, {
    params: clean({ serviceId, date, staffId }),
    signal,
  });
  return res.data.data;
}

// Returns [{ id, name, items: [{ id, name, description, priceMinor, image }] }]
export async function fetchMenu(slug, signal) {
  const res = await api.get(`/businesses/${encodeURIComponent(slug)}/menu`, { signal });
  return res.data.data.categories;
}


// Returns { table: { label }, business: { id, name, slug, isOpen } }
export async function fetchTable(code, signal) {
  const res = await api.get(`/tables/${encodeURIComponent(code)}`, { signal });
  return res.data.data;
}