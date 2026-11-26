import Notification from "./notification.model.js";
import Membership from "../memberships/membership.model.js";
import { hasPermission } from "../memberships/permissions.js";

export async function notifyUser(payload) {
  try {
    await Notification.create(payload);
  } catch (err) {
    console.error("notification failed:", err.message);
  }
}

export async function notifyBusiness(businessId, permission, payload) {
  try {
    const members = await Membership.find({ businessId, status: "active" });
    const targets = members.filter((m) => hasPermission(m, permission));
    await Promise.all(
      targets.map((m) =>
        notifyUser({
          ...payload,
          userId: m.userId,
          businessId,
        })
      )
    );
  } catch (err) {
    console.error("notification failed:", err.message);
  }
}
