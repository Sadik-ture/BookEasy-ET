import Plan from "./plan.model.js";

export const DEFAULT_PLANS = [
  {
    key: "starter",
    name: "Starter",
    monthlyPriceMinor: 30000,
    setupFeeMinor: 100000,
    limits: { maxStaff: 5, maxMenuItems: 40, maxTables: 10, reports: false },
    active: true,
  },
  {
    key: "professional",
    name: "Professional",
    monthlyPriceMinor: 70000,
    setupFeeMinor: 150000,
    limits: { maxStaff: 15, maxMenuItems: 120, maxTables: 30, reports: true },
    active: true,
  },
  {
    key: "premium",
    name: "Premium",
    monthlyPriceMinor: 120000,
    setupFeeMinor: 250000,
    limits: { maxStaff: 40, maxMenuItems: 300, maxTables: 80, reports: true },
    active: true,
  },
];

export async function ensurePlans() {
  for (const plan of DEFAULT_PLANS) {
    await Plan.updateOne({ key: plan.key }, { $set: plan }, { upsert: true });
  }
}
