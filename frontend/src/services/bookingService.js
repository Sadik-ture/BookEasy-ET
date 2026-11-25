import api from "./api";

export async function createBooking(payload) {
  const res = await api.post("/bookings", payload);
  return res.data.data.booking;
}

export async function fetchMyBookings(scope, signal) {
  const res = await api.get("/bookings/my", { params: { scope }, signal });
  return res.data.data.items;
}

export async function cancelBooking(id) {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return res.data.data;
}