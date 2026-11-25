export const ORDER_STATUS = {
  pending: { label: "Received", tone: "warning" },
  accepted: { label: "Accepted", tone: "info" },
  preparing: { label: "Preparing", tone: "brand" },
  ready: { label: "Ready for pickup", tone: "success" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  rejected: { label: "Declined", tone: "danger" },
};

// Steps shown in the progress tracker
export const PROGRESS_STEPS = [
  { key: "pending", label: "Received" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];