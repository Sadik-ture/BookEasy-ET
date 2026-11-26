import Subscription from "./subscription.model.js";
import { fail } from "../../utils/http.js";

const FALLBACK = { maxStaff: 5, maxMenuItems: 40, maxTables: 10, reports: false };

export async function loadSubscription(businessId) {
  const sub = await Subscription.findOne({ businessId }).populate("planId");
  const limits = sub?.planId?.limits || FALLBACK;
  const expired = sub?.endAt && sub.endAt.getTime() < Date.now();
  const active = !sub || (!expired && ["trialing", "active"].includes(sub.status));
  return { sub, limits, active, reports: Boolean(limits.reports) && active };
}

export async function assertWithinLimit(res, businessId, field, count) {
  const { limits, active } = await loadSubscription(businessId);
  if (!active) {
    fail(res, 402, "SUBSCRIPTION_INACTIVE", "This business subscription is not active.");
    return false;
  }
  const cap = limits[field];
  if (count >= cap) {
    fail(res, 403, "PLAN_LIMIT", `The current plan allows up to ${cap}. Upgrade to add more.`);
    return false;
  }
  return true;
}
