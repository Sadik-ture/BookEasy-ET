export const ORDER_TYPES = ["takeaway", "dine_in"]; // dine_in is used with table QR codes in a later step
export const ORDER_STATUSES = ["pending", "accepted", "preparing", "ready", "completed", "cancelled", "rejected"];
export const ACTIVE_ORDER_STATUSES = ["pending", "accepted", "preparing", "ready"];

// Allowed status changes. The restaurant dashboard (next step) will enforce these.
export const ORDER_TRANSITIONS = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export const MAX_QTY_PER_ITEM = 20;
export const MAX_DISTINCT_ITEMS = 30;

export function canTransitionOrder(from, to) {
  return (ORDER_TRANSITIONS[from] || []).includes(to);
}