export const BUSINESS_ROLES = ["owner", "manager", "receptionist", "staff", "kitchen"];

// Empty membership.permissions means "use the role default".
const DEFAULTS = {
  owner: ["profile", "catalog", "team", "bookings", "orders", "kitchen", "reports", "subscription", "tables"],
  manager: ["profile", "catalog", "team", "bookings", "orders", "kitchen", "reports", "tables"],
  receptionist: ["bookings", "orders"],
  staff: ["bookings"],
  kitchen: ["orders", "kitchen"],
};

export function permissionsFor(membership) {
  if (!membership) return [];
  if (Array.isArray(membership.permissions) && membership.permissions.length) {
    return membership.permissions;
  }
  return DEFAULTS[membership.role] || [];
}

export function hasPermission(membership, permission) {
  if (!membership || membership.status !== "active") return false;
  return permissionsFor(membership).includes(permission);
}
