import Table from "./table.model.js";
import Business from "../businesses/business.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";
import { TABLE_CODE_REGEX } from "./tableCode.js";

const notFound = (res) =>
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "This QR code isn't valid." },
  });

// GET /api/v1/tables/:code
export const lookupTable = asyncHandler(async (req, res) => {
  const code = String(req.params.code || "");
  if (!TABLE_CODE_REGEX.test(code)) return notFound(res);

  const table = await Table.findOne({ code, active: true }).lean();
  if (!table) return notFound(res);

  const business = await Business.findOne({ _id: table.businessId, status: "approved", category: "restaurant" })
    .select("name slug openingHours timezone")
    .lean();
  if (!business) return notFound(res);

  // Only public information: the table name and the restaurant
  res.json({
    success: true,
    data: {
      table: { label: table.label },
      business: {
        id: business._id,
        name: business.name,
        slug: business.slug,
        isOpen: isOpenNow(business.openingHours, business.timezone),
      },
    },
  });
});