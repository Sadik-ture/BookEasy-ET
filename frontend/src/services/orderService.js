import api from "./api";

export async function createOrder(payload) {
  const res = await api.post("/orders", payload);
  return res.data.data.order;
}

export async function fetchMyOrders(scope, signal) {
  const res = await api.get("/orders/my", { params: { scope }, signal });
  return res.data.data.items;
}

export async function cancelOrder(id) {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data.data;
}