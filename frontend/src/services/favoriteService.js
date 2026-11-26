import api from "./api";

export async function fetchFavorites() {
  const res = await api.get("/favorites");
  return res.data.data.items;
}

export async function saveFavorite(businessId) {
  await api.post("/favorites", { businessId });
}

export async function removeFavorite(businessId) {
  await api.delete(`/favorites/${businessId}`);
}
