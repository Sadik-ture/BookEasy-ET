import "dotenv/config";
import mongoose from "mongoose";
import User from "../modules/users/user.model.js";
import Business from "../modules/businesses/business.model.js";

const [, , emailArg, slugArg] = process.argv;
if (!emailArg || !slugArg) {
  console.log("Usage: node src/scripts/assignOwner.js you@example.com habesha-restaurant");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const user = await User.findOne({ email: emailArg.toLowerCase() });
  const business = await Business.findOne({ slug: slugArg.toLowerCase() });
  if (!user) throw new Error(`No user with email ${emailArg}`);
  if (!business) throw new Error(`No business with slug ${slugArg}`);
  if (await Business.exists({ ownerId: user._id, _id: { $ne: business._id } })) {
    throw new Error("That user already owns a different business");
  }
  business.ownerId = user._id;
  await business.save();
  if (user.role === "customer") await User.updateOne({ _id: user._id }, { $set: { role: "business_owner" } });
  console.log(`✅ ${user.email} now owns ${business.name}`);
} catch (err) {
  console.error("❌", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}