import Business from "../businesses/business.model.js";

// Loads the business owned by the logged-in user. The business id NEVER comes from the request,
// so one owner can never read or change another owner's data.
export async function loadMyBusiness(req, res, next) {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: { code: "NO_BUSINESS", message: "You haven't set up a business yet." },
      });
    }
    if (business.status === "suspended" || business.status === "rejected") {
      return res.status(403).json({
        success: false,
        error: { code: "BUSINESS_BLOCKED", message: "This business is not active. Please contact support." },
      });
    }
    req.business = business;
    next();
  } catch (err) {
    next(err);
  }
}

export const requireCategory =
  (...categories) =>
  (req, res, next) => {
    if (!categories.includes(req.business.category)) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_AVAILABLE", message: "This is not available for your type of business." },
      });
    }
    next();
  };