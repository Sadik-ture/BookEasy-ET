import api from "./api";

const data = (res) => res.data.data;

export const getSummary = async (signal) => data(await api.get("/me/summary", { signal }));

// Business
export const getMyBusiness = async (signal) => data(await api.get("/manage/business", { signal })).business;
export const createMyBusiness = async (payload) => data(await api.post("/manage/business", payload)).business;
export const setAutoConfirm = async (autoConfirm) => data(await api.patch("/manage/business/settings", { autoConfirm }));
export const getOverview = async (signal) => data(await api.get("/manage/overview", { signal }));

// Bookings
export const listBookings = async (scope, signal) => data(await api.get("/manage/bookings", { params: { scope }, signal })).items;
export const setBookingStatus = (id, status) => api.patch(`/manage/bookings/${id}/status`, { status });

// Orders
export const listOrders = async (scope, signal) => data(await api.get("/manage/orders", { params: { scope }, signal })).items;
export const setOrderStatus = (id, status) => api.patch(`/manage/orders/${id}/status`, { status });

// Menu
export const getManageMenu = async (signal) => data(await api.get("/manage/menu", { signal })).categories;
export const addCategory = (name) => api.post("/manage/menu/categories", { name });
export const addMenuItem = (payload) => api.post("/manage/menu/items", payload);
export const updateMenuItem = (id, payload) => api.patch(`/manage/menu/items/${id}`, payload);

// Services and staff
export const listManageServices = async (signal) => data(await api.get("/manage/services", { signal })).items;
export const addService = (payload) => api.post("/manage/services", payload);
export const updateService = (id, payload) => api.patch(`/manage/services/${id}`, payload);
export const listManageStaff = async (signal) => data(await api.get("/manage/staff", { signal })).items;
export const addStaff = (payload) => api.post("/manage/staff", payload);
export const updateStaff = (id, payload) => api.patch(`/manage/staff/${id}`, payload);