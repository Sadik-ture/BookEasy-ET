import mongoose from "mongoose";
import Membership from "../modules/memberships/membership.model.js";
import Business from "../modules/businesses/business.model.js";
import { hasPermission } from "../modules/memberships/permissions.js";
import { fail } from "../utils/http.js";

export function requirePermission(...needed) {
  return async (req, res, next) => {
    try {
      const businessId = req.get("x-business-id") || (req.method === "GET" ? req.query.businessId : "");
      if (!businessId || !mongoose.isValidObjectId(businessId)) {
        return fail(res, 400, "BUSINESS_REQUIRED", "Choose a business workspace first.");
      }
      const membership = await Membership.findOne({
        userId: req.user._id,
        businessId,
        status: "active",
      });
      if (!membership) return fail(res, 403, "FORBIDDEN", "You do not have access to this business.");
      if (needed.length && !needed.every((p) => hasPermission(membership, p))) {
        return fail(res, 403, "FORBIDDEN", "You do not have permission to do this.");
      }
      const business = await Business.findById(businessId);
      if (!business) return fail(res, 404, "NOT_FOUND", "Business not found.");
      req.membership = membership;
      req.business = business;
      next();
    } catch (err) {
      next(err);
    }
  };
}
