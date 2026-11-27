import "dotenv/config";
import mongoose from "mongoose";
import Business from "../modules/businesses/business.model.js";
import Table from "../modules/tables/table.model.js";
import { makeTableCode } from "../modules/tables/tableCode.js";

const slugs = ["habesha-restaurant", "lalibela-kitchen", "addis-grill-and-cafe"];
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

await mongoose.connect(process.env.MONGODB_URI);
try {
  for (const slug of slugs) {
    const business = await Business.findOne({ slug, category: "restaurant" });
    if (!business) {
      console.warn(`⚠️  ${slug} not found. Run: node src/scripts/seed.js first`);
      continue;
    }
    console.log(`\n${business.name}`);
    for (let n = 1; n <= 5; n++) {
      const label = `Table ${n}`;
      // The code is only set the first time, so running this again never changes existing QR codes
      await Table.updateOne(
        { businessId: business._id, label },
        { $setOnInsert: { code: makeTableCode() }, $set: { active: true } },
        { upsert: true }
      );
      const t = await Table.findOne({ businessId: business._id, label });
      console.log(`  ${label}: ${ORIGIN}/t/${t.code}`);
    }
  }
} finally {
  await mongoose.disconnect();
}